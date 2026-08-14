import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { IterationDataResourceType } from "../managers/iterations-manager-types.js";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6347"];

function CompletedPie({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  return (
    <div className="flex-1 min-w-0">
      <h5 className="text-sm font-bold text-center">{title}</h5>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HoursPerPointStat({
  totalCompletedHours,
  totalCompletedPoints,
}: {
  totalCompletedHours: number;
  totalCompletedPoints: number;
}) {
  const hoursPerPoint =
    totalCompletedPoints > 0 ? totalCompletedHours / totalCompletedPoints : null;

  return (
    <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
      <h5 className="text-sm font-bold text-center">Hours / Point</h5>
      <div className="text-4xl font-bold">
        {hoursPerPoint !== null ? hoursPerPoint.toFixed(1) : "N/A"}
      </div>
      <div className="text-xs text-gray-400 text-center mt-1">
        {totalCompletedHours} hrs over {totalCompletedPoints} pts
        <br />
        (team-wide, this iteration)
      </div>
    </div>
  );
}

export const CompletedWorkChart = ({
  resource,
}: {
  resource: IterationDataResourceType;
}) => {
  const completedPointsByMember = resource.members.map((member) => ({
    name: member.name,
    value: member.workload.totalPointsCompleted,
  }));
  const completedHoursByMember = resource.members.map((member) => ({
    name: member.name,
    value: member.workload.totalCompleted,
  }));

  return (
    <>
      <h4 className="text-lg font-bold">Completed</h4>
      <div className="flex flex-row gap-4 w-full flex-wrap">
        <CompletedPie title="Points" data={completedPointsByMember} />
        <CompletedPie title="Hours" data={completedHoursByMember} />
        <HoursPerPointStat
          totalCompletedHours={resource.team.workload.totalCompleted}
          totalCompletedPoints={resource.team.workload.totalPointsCompleted}
        />
      </div>
    </>
  );
};
