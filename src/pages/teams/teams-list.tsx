import React from "react";
import { NavLink } from "react-router-dom";
import { getTeams } from "../../data/api/teams.js";
import { useTeamsStore } from "../../data/teams-store.js";

export function TeamsRoot() {
  const { teams, lastUpdated, saveTeams } = useTeamsStore((state) => state);

  const fetchTeams = async () => {
    const getTeamsResponse = await getTeams();
    saveTeams({ teams: getTeamsResponse.value });
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header>
        <h1 className="text-4xl font-bold mb-4 card-title">Teams</h1>
      </header>
      <main className="gap-4 items-center w-full">
        {teams.length === 0 && <p className="w-full text-center">No teams found</p>}
        <div className="flex flex-row gap-3 flex-wrap justify-between">
          {teams &&
            teams
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((team) => (
                <NavLink
                  key={team.id}
                  to={`/teams/${team.id}/iterations`}
                  className="border-1 border-black py-3 px-5 w-[30%] hover:bg-slate-900 text-center"
                >
                  {team.name}
                </NavLink>
              ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Last updated: {lastUpdated.toLocaleString()}</p>
          <a href="#" onClick={fetchTeams}>
            Refresh
          </a>
        </div>
      </main>
    </div>
  );
}
