import {
  Billing,
  Person,
  Workspace,
} from "@sweetr/graphql-types/frontend/graphql";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type PersonData = Pick<Person, "id" | "name" | "handle" | "avatar" | "email">;
export type WorkspaceData = Pick<
  Workspace,
  | "id"
  | "name"
  | "avatar"
  | "handle"
  | "gitUninstallUrl"
  | "isActiveCustomer"
  | "featureAdoption"
> & { billing?: Partial<Billing> | null };

interface AppStore {
  authenticatedUser?: PersonData;
  workspace?: WorkspaceData;
  availableWorkspaces: WorkspaceData[];
  setWorkspace: (workspace: WorkspaceData) => void;
  setAvailableWorkspaces: (workspaces: WorkspaceData[]) => void;
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        authenticatedUser: undefined,
        availableWorkspaces: [],
        setWorkspace: (workspace: WorkspaceData) => set(() => ({ workspace })),
        setAvailableWorkspaces: (workspaces: WorkspaceData[]) =>
          set(() => ({ availableWorkspaces: workspaces })),
      }),
      { name: "app-store", version: 1 },
    ),
  ),
);
