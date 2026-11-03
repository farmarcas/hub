import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAdmin } from "@/components/layout/RequireAdmin";
import { ROUTES } from "@/lib/routes";
import { ExplorePage } from "./ExplorePage";
import { GroupsPage } from "./GroupsPage";
import { PoliciesPage } from "./PoliciesPage";
import { SolutionFormPage } from "./SolutionFormPage";
import { SolutionsPage } from "./SolutionsPage";
import { UsersPage } from "./UsersPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<ExplorePage />} />
        <Route path={ROUTES.policies} element={<PoliciesPage />} />
        <Route
          path={ROUTES.solutions}
          element={
            <RequireAdmin>
              <SolutionsPage />
            </RequireAdmin>
          }
        />
        <Route
          path={ROUTES.newSolution}
          element={
            <RequireAdmin>
              <SolutionFormPage />
            </RequireAdmin>
          }
        />
        <Route
          path={`${ROUTES.solutions}/:id`}
          element={
            <RequireAdmin>
              <SolutionFormPage />
            </RequireAdmin>
          }
        />
        <Route
          path={ROUTES.groups}
          element={
            <RequireAdmin>
              <GroupsPage />
            </RequireAdmin>
          }
        />
        <Route
          path={ROUTES.users}
          element={
            <RequireAdmin>
              <UsersPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.explore} replace />} />
      </Route>
    </Routes>
  );
}
