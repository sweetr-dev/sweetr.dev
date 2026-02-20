import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { getBypassRlsPrisma, getPrisma } from "./prisma";

type RlsSettings = {
  workspace_id: string | null;
  bypass_rls: string | null;
};

const selectRlsSql = Prisma.sql`
  SELECT
    current_setting('app.current_workspace_id', true) AS workspace_id,
    current_setting('app.bypass_rls', true) AS bypass_rls
`;

describe("RLS Extension", () => {
  describe("getBypassRlsPrisma", () => {
    it("sets bypass_rls and workspace_id for standalone raw queries", async () => {
      const prisma = getBypassRlsPrisma();
      const result = await prisma.$queryRaw<RlsSettings[]>(selectRlsSql);

      expect(result[0].bypass_rls).toBe("on");
      expect(result[0].workspace_id).toBe("0");
    });

    it("sets bypass_rls within interactive transactions", async () => {
      const prisma = getBypassRlsPrisma();
      const result = await prisma.$transaction(async (tx) => {
        return tx.$queryRaw<RlsSettings[]>(selectRlsSql);
      });

      expect(result[0].bypass_rls).toBe("on");
      expect(result[0].workspace_id).toBe("0");
    });

    it("sets bypass_rls within batch transactions", async () => {
      const prisma = getBypassRlsPrisma();
      const [result] = await prisma.$transaction([
        prisma.$queryRaw<RlsSettings[]>(selectRlsSql),
      ]);

      expect(result[0].bypass_rls).toBe("on");
      expect(result[0].workspace_id).toBe("0");
    });
  });

  describe("getPrisma with workspaceId", () => {
    it("sets workspace_id for standalone raw queries", async () => {
      const prisma = getPrisma(42);
      const result = await prisma.$queryRaw<RlsSettings[]>(selectRlsSql);

      expect(result[0].workspace_id).toBe("42");
      expect(result[0].bypass_rls).toBeFalsy();
    });

    it("sets workspace_id within interactive transactions", async () => {
      const prisma = getPrisma(42);
      const result = await prisma.$transaction(async (tx) => {
        return tx.$queryRaw<RlsSettings[]>(selectRlsSql);
      });

      expect(result[0].workspace_id).toBe("42");
      expect(result[0].bypass_rls).toBeFalsy();
    });

    it("sets workspace_id within batch transactions", async () => {
      const prisma = getPrisma(42);
      const [result] = await prisma.$transaction([
        prisma.$queryRaw<RlsSettings[]>(selectRlsSql),
      ]);

      expect(result[0].workspace_id).toBe("42");
      expect(result[0].bypass_rls).toBeFalsy();
    });
  });

  describe("getPrisma without workspaceId", () => {
    it("returns base prisma without RLS session variables", async () => {
      const prisma = getPrisma();
      const result = await prisma.$queryRaw<RlsSettings[]>(selectRlsSql);

      expect(result[0].workspace_id).toBeFalsy();
      expect(result[0].bypass_rls).toBeFalsy();
    });
  });
});
