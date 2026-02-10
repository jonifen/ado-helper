import { Routes, Route, Navigate } from "react-router-dom";
import { PageRoot } from "./pages/index.js";
import { Settings } from "./pages/settings.js";
import { TeamsRoot } from "./pages/teams/index.js";
import { NotFound } from "./pages/not-found.js";
import { TeamById } from "./pages/teams/by-id.js";

export function AppRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<PageRoot />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/teams" element={<TeamsRoot />} />
        <Route path="/teams:id" element={<TeamById id=":id" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
