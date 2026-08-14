import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { IterationsValueType } from "../data/api/iterations-types.js";
import type { IterationWorkItemsType } from "../managers/iterations-manager-types.js";
import { getCachedIterationData } from "../data/iteration-store.js";
import { isDeliveredState } from "../utils/delivered-state.js";

// Fixed rather than auto-sized, so the grouping rows below the chart (built
// with plain flexbox, not SVG) can reserve the exact same width and line up
// under the plot area instead of the container's left edge.
const Y_AXIS_WIDTH = 36;

type VelocityPointType = {
  iterationId: string;
  name: string;
  quarter: string;
  fy: string;
  points: number;
  hours: number;
  hasData: boolean;
  // Constant 1 for every point, plotted on its own fixed-domain hidden
  // axis so it always renders as a full-height invisible bar — see the
  // "click" Bar/YAxis below for why.
  clickTarget: number;
};

type GroupRunType = {
  key: string;
  count: number;
};

// Sums completed story points straight from the cached work item tree
// rather than trusting a pre-aggregated total on the cached payload —
// `workItems` (with each item's `points`/`state`) has been part of the
// cached shape since the very first version of this data model, so it's
// available even on iterations cached long before "completed points"
// tracking existed, unlike a newer aggregate field which would silently
// read as undefined (and show as zero) on that older cached data.
function sumCompletedPoints(workItems: IterationWorkItemsType[]): number {
  return workItems.reduce((total, item) => {
    const itemPoints = isDeliveredState(item.state) ? item.points : 0;
    return total + itemPoints + sumCompletedPoints(item.children);
  }, 0);
}

// Completed hours aren't gated by state — the CompletedWork field already
// reflects actual work done regardless of the item's current state,
// consistent with how the team-level "Completed" hours pie is calculated.
function sumCompletedHours(workItems: IterationWorkItemsType[]): number {
  return workItems.reduce(
    (total, item) => total + item.completed + sumCompletedHours(item.children),
    0,
  );
}

// Splits an iteration path like "FY25-26\Q4-25-26\Sprint 3" into its
// leaf/quarter/FY segments, taken from the end so it doesn't matter how
// many project/area segments precede them.
function getPathSegments(path: string): { fy: string; quarter: string; leaf: string } {
  const parts = path.split("\\").filter(Boolean);
  const leaf = parts[parts.length - 1] ?? "";
  const quarter = parts.length >= 2 ? (parts[parts.length - 2] ?? "—") : "—";
  const fy = parts.length >= 3 ? (parts[parts.length - 3] ?? "—") : "—";
  return { fy, quarter, leaf };
}

// Groups consecutive equal keys into runs, e.g. ["Q4","Q4","Q1","Q1","Q1"]
// -> [{key:"Q4",count:2},{key:"Q1",count:3}] — only ever merges *adjacent*
// entries, matching how the chart is already sorted chronologically.
function computeGroupRuns(keys: string[]): GroupRunType[] {
  const runs: GroupRunType[] = [];
  for (const key of keys) {
    const last = runs[runs.length - 1];
    if (last && last.key === key) {
      last.count += 1;
    } else {
      runs.push({ key, count: 1 });
    }
  }
  return runs;
}

function GroupingRow({ runs }: { runs: GroupRunType[] }) {
  return (
    <div className="flex flex-row w-full">
      <div style={{ width: Y_AXIS_WIDTH, flexShrink: 0 }} />
      <div className="flex flex-row flex-1 min-w-0">
        {runs.map((run, index) => (
          <div
            key={`${run.key}-${index}`}
            style={{ flexGrow: run.count, flexBasis: 0 }}
            className={`min-w-0 border-t border-[#5b6270] pt-1 text-center text-xs text-gray-400 truncate px-1 ${index % 2 ? "bg-gray-900" : "bg-transparent"}`}
            title={run.key}
          >
            {run.key}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  decimals,
  suffix,
  sampleSize,
}: {
  label: string;
  value: number | null;
  decimals: number;
  suffix: string;
  sampleSize: number;
}) {
  return (
    <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
      <h5 className="text-sm font-bold text-center">{label}</h5>
      <div className="text-4xl font-bold">
        {value !== null ? `${value.toFixed(decimals)} ${suffix}` : "N/A"}
      </div>
      <div className="text-xs text-gray-400 text-center mt-1">
        Based on {sampleSize} cached sprint{sampleSize === 1 ? "" : "s"}
      </div>
    </div>
  );
}

export function VelocityChart({
  teamId,
  iterations,
}: {
  teamId: string;
  iterations: IterationsValueType[];
}) {
  const [velocity, setVelocity] = useState<VelocityPointType[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (iterations.length === 0) {
      setVelocity([]);
      return;
    }

    let cancelled = false;

    const loadVelocity = async () => {
      const sorted = [...iterations].sort(
        (a, b) =>
          new Date(a.attributes.startDate).valueOf() -
          new Date(b.attributes.startDate).valueOf(),
      );

      const points = await Promise.all(
        sorted.map(async (iteration) => {
          const cached = await getCachedIterationData(teamId, iteration.id);
          const { fy, quarter, leaf } = getPathSegments(iteration.path);
          return {
            iterationId: iteration.id,
            name: leaf || iteration.name,
            quarter,
            fy,
            points: cached ? sumCompletedPoints(cached.workItems) : 0,
            hours: cached ? sumCompletedHours(cached.workItems) : 0,
            hasData: cached !== null,
            clickTarget: 1,
          };
        }),
      );

      if (!cancelled) setVelocity(points);
    };

    loadVelocity();

    return () => {
      cancelled = true;
    };
  }, [teamId, iterations]);

  const nameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const point of velocity || []) map[point.iterationId] = point.name;
    return map;
  }, [velocity]);

  const quarterRuns = useMemo(
    () => computeGroupRuns((velocity || []).map((point) => point.quarter)),
    [velocity],
  );
  const fyRuns = useMemo(
    () => computeGroupRuns((velocity || []).map((point) => point.fy)),
    [velocity],
  );

  // Averages only ever consider sprints we actually have cached data for —
  // unlike the chart itself, which shows a real zero bar for uncached
  // sprints, letting those drag the averages down would be misleading.
  const withData = useMemo(
    () => (velocity || []).filter((point) => point.hasData),
    [velocity],
  );
  const averagePointsPerSprint =
    withData.length > 0
      ? withData.reduce((sum, point) => sum + point.points, 0) / withData.length
      : null;
  const totalHoursWithData = withData.reduce((sum, point) => sum + point.hours, 0);
  const totalPointsWithData = withData.reduce((sum, point) => sum + point.points, 0);
  const averageHoursPerPoint =
    totalPointsWithData > 0 ? totalHoursWithData / totalPointsWithData : null;

  const goToIteration = (entry: { payload?: VelocityPointType }) => {
    const iterationId = entry.payload?.iterationId;
    if (iterationId) {
      navigate(`/teams/${teamId}/iterations/${iterationId}`);
    }
  };

  if (velocity === null) {
    return <div className="text-sm">Loading velocity</div>;
  }

  if (velocity.length === 0) {
    return <i className="text-sm">No iterations found for this team</i>;
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold card-title !mt-0">
        Story Point Velocity
      </h3>
      <i className="text-xs">
        Completed story points per iteration, from whatever's already cached
        locally — iterations with no cached data show as zero. Click a bar
        to open that iteration.
      </i>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={velocity}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#33373C" />
            <XAxis
              dataKey="iterationId"
              tick={{ fontSize: 12 }}
              tickFormatter={(id: string) => nameById[id] ?? id}
              interval={0}
            />
            <YAxis
              width={Y_AXIS_WIDTH}
              tick={{ fontSize: 12 }}
              allowDecimals={false}
            />
            <YAxis yAxisId="click" domain={[0, 1]} hide />
            <Tooltip
              labelFormatter={(id) => nameById[String(id)] ?? String(id)}
            />
            {/* Invisible full-height bar so the whole column is clickable
                even when there's no cached data (points = 0 would otherwise
                render a zero-height, unclickable bar). Drawn first so the
                visible bar on top still gets click priority over its own
                colored area. */}
            <Bar
              yAxisId="click"
              dataKey="clickTarget"
              fill="transparent"
              cursor="pointer"
              onClick={goToIteration}
              isAnimationActive={false}
              stackId="velocity"
            />
            <Bar
              dataKey="points"
              name="Completed Points"
              fill="#9BCF69"
              cursor="pointer"
              onClick={goToIteration}
              stackId="velocity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <GroupingRow runs={quarterRuns} />
      <GroupingRow runs={fyRuns} />
      <div className="flex flex-row gap-4 w-full flex-wrap mt-4">
        <StatTile
          label="Avg Points / Sprint"
          value={averagePointsPerSprint}
          decimals={1}
          suffix="pts"
          sampleSize={withData.length}
        />
        <StatTile
          label="Avg Hours / Point"
          value={averageHoursPerPoint}
          decimals={1}
          suffix="hrs/pt"
          sampleSize={withData.length}
        />
      </div>
    </div>
  );
}
