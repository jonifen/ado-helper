import { Routes, Route, Navigate } from "react-router-dom";
import { PageRoot } from "./pages/index.js";
import { Settings } from "./pages/settings.js";
import { TeamsRoot } from "./pages/teams/teams-list.js";
import { NotFound } from "./pages/not-found.js";
import { Team } from "./pages/teams/id.js";
import { TeamIterations } from "./pages/teams/iterations.js";

export function AppRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<PageRoot />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/teams" element={<TeamsRoot />} />
        <Route path="/teams/:teamId" element={<Team />} />
        <Route path="/teams/:teamId/iterations" element={<Team />} />
        <Route path="/teams/:teamId/iterations/:iterationId" element={<TeamIterations />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
