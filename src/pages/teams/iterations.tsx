import React from "react";
import { useParams } from "react-router-dom";
import { CsvDownloadButton } from "../../components/csv-download-button.js";
import { IterationWorkitems } from "../../components/iteration-workitems.js";
import { IterationCalculations } from "../../components/iteration-calculations.js";
import { CompletedWorkChart } from "../../components/completed-work-chart.js";
import { useState, useEffect } from "react";
import { useSettingsStore } from "../../data/settings-store.js";
import { useIterationsStore } from "../../data/iterations-store.js";
import { useTeamsStore } from "../../data/teams-store.js";
import type { GetTeamType } from "../../data/api/teams-types.js";
import { useIterationStore } from "../../data/iteration-store.js";
import type { IterationsValueType } from "../../data/api/iterations-types.js";
import { IterationsPicker } from "../../components/iterations-picker.js";

export function TeamIterations() {
  const { teamId, iterationId } = useParams<{
    teamId: string;
    iterationId: string;
  }>();
  if (!teamId || !iterationId) return null;

  const { organisation, project } = useSettingsStore((state) => state);
  const { iterations, loadIterations, refreshIterations } = useIterationsStore(
    (state) => state,
  );
  const team =
    useTeamsStore((state) => state.teams.find((team) => team.id === teamId)) ||
    ({} as GetTeamType);
  const {
    loadIteration,
    refreshIteration,
    data,
    refreshing,
    lastUpdated: iterationDataLastUpdated,
  } = useIterationStore((state) => state);

  const fetchData = async () => {
    await refreshIterations(teamId);
    await refreshIteration(teamId, iterationId);
  };

  useEffect(() => {
    if (!teamId || !iterationId) return;

    const loadData = async () => {
      await loadIterations(teamId);
      await loadIteration(teamId, iterationId);
    };

    loadData();
  }, [iterationId, teamId]);

  if (refreshing)
    return (
      <div className="font-sans items-center justify-items-center min-h-screen px-8 py-3">
        Loading
      </div>
    );
  if (!data.path) return null;

  return (
    <div>
      <div className="font-sans items-center justify-items-center min-h-screen px-8 py-3">
        <IterationsPicker teamId={teamId} iterations={iterations} />
        <div className="flex flex-col gap-2 row-start-2 items-center sm:items-start max-w-full">
          <div>
            <h1 className="text-3xl font-bold card-title !mt-0">
              {data.teamName}
            </h1>
            <h2 className="text-2xl font-bold card-title !mt-0">{data.path}</h2>
          </div>
          <div>
            <strong>Start date:</strong> {data.startDate?.toDateString()}
            {" | "}
            <strong>End date:</strong> {data.endDate?.toDateString()}
            <CsvDownloadButton teamId={teamId} iterationId={iterationId} />
            <span className="text-sm text-gray-500">
              {" "}
              [ Last updated: {iterationDataLastUpdated.toLocaleString()}{" "}
            </span>
            <a href="#" onClick={fetchData} className="text-sm">
              Refresh
            </a>
            <span className="text-sm text-gray-500"> ]</span>
          </div>

          <IterationWorkitems workItems={data.workItems} />

          <IterationCalculations
            resource={data.resource}
            workItems={data.workItems}
            sprintEndDate={data.endDate}
          />

          <CompletedWorkChart resource={data.resource} />

          <hr className="border w-full border-teal-800" />
          <i className="text-sm">
            Data collated at {data.payloadCreatedDate?.toUTCString()}.{" "}
            <a
              href={`https://dev.azure.com/${organisation}/${project}/_sprints/taskboard/${team.name}/${data.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Azure DevOps board link
            </a>
          </i>
        </div>
      </div>
    </div>
  );
}
