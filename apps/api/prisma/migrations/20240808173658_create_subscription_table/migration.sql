-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "trialEndAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "customerId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "object" JSONB NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Subscription" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_workspaceId_key" ON "Subscription"("workspaceId");
CREATE UNIQUE INDEX "Subscription_subscriptionId_key" ON "Subscription"("subscriptionId");

-- RLS
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Subscription" USING ("id" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Subscription" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
