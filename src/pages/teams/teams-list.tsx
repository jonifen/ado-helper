import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getTeams } from "../../data/api/teams.js";
import type { GetTeamsType } from "../../data/api/teams-types.js";

export function TeamsRoot() {
  const [teamsData, setTeamsData] = useState<GetTeamsType>();

  useEffect(() => {
    const cb = async () => {
      const getTeamsResponse = await getTeams();
      setTeamsData(getTeamsResponse);
    };

    cb();
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header>
        <h1 className="text-4xl font-bold mb-4 card-title">Teams</h1>
      </header>
      <main className="gap-4 items-center w-full">
        {!teamsData && <p className="w-full text-center">No teams found</p>}
        <div className="flex flex-row gap-3 flex-wrap justify-between">
          {teamsData &&
            teamsData.value
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((team) => (
                <NavLink
                  key={team.id}
                  to={`/teams/${team.id}/iterations`}
                  className="border-1 border-black py-5 px-8 hover:bg-gray-800"
                >
                  {team.name}
                </NavLink>
              ))}
        </div>
      </main>
    </div>
  );
}
