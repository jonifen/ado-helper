import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type {
  IterationsType,
  IterationsValueType,
} from "../../data/api/iterations-types.js";
import { getIteration, getIterations } from "../../data/api/iterations.js";
import { getTeam } from "../../data/api/teams.js";
import type { GetTeamType } from "../../data/api/teams-types.js";

export function Team() {
  const { teamId } = useParams<{ teamId: string }>();
  const [teamData, setTeamData] = useState<GetTeamType>();
  //const [iterationData, setIterationData] = useState<IterationsValueType>();
  const [iterationsData, setIterationsData] = useState<IterationsType>();

  useEffect(() => {
    if (!teamId) return;

    const cb = async () => {
      const getTeamResponse = await getTeam(teamId);
      //const getIterationResponse = await getIteration(teamId, "iterationId");
      const getIterationsResponse = await getIterations(teamId);
      setTeamData(getTeamResponse);
      //setIterationData(getIterationResponse);
      setIterationsData(getIterationsResponse);
    };

    cb();
  }, []);

  return (
    <div>
      <p>Team {teamData?.name}</p>
      {iterationsData &&
        iterationsData.value.map((iteration) => (
          <div key={iteration.id}>
            <p>{iteration.name}</p>
            <p>
              {iteration.attributes.startDate} -{" "}
              {iteration.attributes.finishDate}
            </p>
          </div>
        ))}
    </div>
  );
}
