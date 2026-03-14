import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";

vi.mock("../../env", () => ({
  env: { FRONTEND_URL: "http://localhost" },
  isProduction: false,
  isDev: true,
}));

vi.mock("../../lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../lib/sentry", () => ({
  captureException: vi.fn(),
  setupFastifyErrorHandler: vi.fn(),
}));

vi.mock("../api-keys/services/api-keys.service", () => ({
  findApiKeyOrThrow: vi.fn(),
  getBearerToken: (header: string | undefined) =>
    (header ?? "").trim().replace(/^bearer\s+/i, ""),
}));

vi.mock("../../bull-mq/queues", () => ({
  addJob: vi.fn(),
  SweetQueue: { DEPLOYMENT_TRIGGERED_BY_API: "deployment.triggered_by_api" },
}));

import { deploymentsRouter } from "./deployments.router";
import { errorHandler } from "../../lib/fastify-helpers";
import { AuthorizationException } from "../errors/exceptions/authorization.exception";

import { findApiKeyOrThrow } from "../api-keys/services/api-keys.service";
import { addJob } from "../../bull-mq/queues";

const mockedFindApiKey = vi.mocked(findApiKeyOrThrow);
const mockedAddJob = vi.mocked(addJob);

const validBody = {
  repositoryFullName: "acme/backend",
  environment: "production",
  app: "backend-api",
  version: "v1.0.0",
  commitHash: "abc123",
};

describe("POST /v1/deployments", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify();
    app.setErrorHandler(errorHandler);
    await app.register(deploymentsRouter);
    await app.ready();

    mockedFindApiKey.mockResolvedValue({ id: 1, workspaceId: 42 } as any);
    mockedAddJob.mockResolvedValue(undefined as any);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.close();
  });

  it("returns 401 when authorization header is missing", async () => {
    mockedFindApiKey.mockRejectedValue(
      new AuthorizationException("Invalid API key")
    );

    const response = await app.inject({
      method: "POST",
      url: "/v1/deployments",
      payload: validBody,
    });

    expect(response.statusCode).toBe(401);
  });

  it("returns 401 when API key is invalid", async () => {
    mockedFindApiKey.mockRejectedValue(
      new AuthorizationException("Invalid API key")
    );

    const response = await app.inject({
      method: "POST",
      url: "/v1/deployments",
      headers: { authorization: "Bearer bad-key" },
      payload: validBody,
    });

    expect(response.statusCode).toBe(401);
  });

  it("strips Bearer prefix before validating the key", async () => {
    await app.inject({
      method: "POST",
      url: "/v1/deployments",
      headers: { authorization: "Bearer my-secret-key" },
      payload: validBody,
    });

    expect(mockedFindApiKey).toHaveBeenCalledWith("my-secret-key");
  });

  it("works without Bearer prefix", async () => {
    await app.inject({
      method: "POST",
      url: "/v1/deployments",
      headers: { authorization: "raw-key" },
      payload: validBody,
    });

    expect(mockedFindApiKey).toHaveBeenCalledWith("raw-key");
  });

  it("returns 422 when required fields are missing", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/deployments",
      headers: { authorization: "key" },
      payload: { repositoryFullName: "acme/backend" },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().validationErrors).toBeDefined();
  });

  it("returns 422 when fields exceed max length", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/deployments",
      headers: { authorization: "key" },
      payload: { ...validBody, version: "x".repeat(71) },
    });

    expect(response.statusCode).toBe(422);
  });

  it("returns 422 when deployedAt is not a valid ISO 8601 datetime", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/deployments",
      headers: { authorization: "key" },
      payload: { ...validBody, deployedAt: "not-a-date" },
    });

    expect(response.statusCode).toBe(422);
  });

  it("returns 202 and enqueues a job on success", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/deployments",
      headers: { authorization: "Bearer valid-key" },
      payload: validBody,
    });

    expect(response.statusCode).toBe(202);
    expect(mockedAddJob).toHaveBeenCalledOnce();
    expect(mockedAddJob).toHaveBeenCalledWith(
      "deployment.triggered_by_api",
      expect.objectContaining({
        workspaceId: 42,
        repositoryFullName: "acme/backend",
        environment: "production",
        app: "backend-api",
        version: "v1.0.0",
        commitHash: "abc123",
      })
    );
  });

  it("passes deployedAt as a Date when provided", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/deployments",
      headers: { authorization: "key" },
      payload: { ...validBody, deployedAt: "2025-01-15T10:00:00Z" },
    });

    expect(response.statusCode).toBe(202);
    expect(mockedAddJob).toHaveBeenCalledWith(
      "deployment.triggered_by_api",
      expect.objectContaining({
        deployedAt: new Date("2025-01-15T10:00:00Z"),
      })
    );
  });

  it("defaults deployedAt to current time when not provided", async () => {
    const before = new Date();

    await app.inject({
      method: "POST",
      url: "/v1/deployments",
      headers: { authorization: "key" },
      payload: validBody,
    });

    const after = new Date();
    const jobData = mockedAddJob.mock.calls[0][1] as any;
    expect(jobData.deployedAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime()
    );
    expect(jobData.deployedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("includes optional fields in the job payload", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/deployments",
      headers: { authorization: "key" },
      payload: {
        ...validBody,
        description: "Release v1.0.0",
        author: "jane-doe",
        monorepoPath: "packages/api",
      },
    });

    expect(response.statusCode).toBe(202);
    expect(mockedAddJob).toHaveBeenCalledWith(
      "deployment.triggered_by_api",
      expect.objectContaining({
        description: "Release v1.0.0",
        author: "jane-doe",
        monorepoPath: "packages/api",
      })
    );
  });
});
