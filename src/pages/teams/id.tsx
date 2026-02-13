import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useIterationsStore } from "../../data/iterations-store.js";
import { useTeamsStore } from "../../data/teams-store.js";
import { IterationsPicker } from "../../components/iterations-picker.js";
import { useSettingsStore } from "../../data/settings-store.js";

export function Team() {
  const { teamId } = useParams<{ teamId: string }>();

  const { iterations, lastUpdated, loadIterations, refreshIterations } =
    useIterationsStore((state) => state);
  const { teams } = useTeamsStore((state) => state);

  useEffect(() => {
    if (!teamId) return;

    const loadData = async () => {
      await loadIterations(teamId);
    };

    loadData();
  }, []);

  const { pat, organisation, project } = useSettingsStore((state) => state);
  
  if (!pat || !organisation || !project) {
    return (
      <div className="font-sans items-center justify-items-center min-h-screen px-8 py-3">
        <p>
          Please go to the Settings page and enter your Personal Access Token,
          Organisation, and Project to see your teams.
        </p>
      </div>
    );
  }

  if (!teamId) {
    return <div>No team ID provided.</div>;
  }

  const fetchData = async () => {
    if (!teamId) return;
    await refreshIterations(teamId);
  };

  return (
    <div className="font-sans items-center justify-items-center min-h-screen px-8 pb-3">
      <h2 className="text-xl font-bold">Iterations for Team {teams.find((team) => team.id === teamId)?.name}</h2>
      <IterationsPicker teamId={teamId} iterations={iterations} />
      <div>
        <span className="text-sm text-gray-500">
          {" "}
          [ Last updated: {lastUpdated.toLocaleString()}{" "}
        </span>
        <a href="#" onClick={fetchData} className="text-sm">
          Refresh
        </a>
        <span className="text-sm text-gray-500"> ]</span>
      </div>
    </div>
  );
}
