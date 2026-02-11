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

export const CompletedWorkChart = ({
  resource,
}: {
  resource: IterationDataResourceType;
}) => {
  const completedWorkByMember = resource.members.map((member) => ({
    name: member.name,
    value: member.workload.totalCompleted,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6347"];

  return (
    <>
      <h4>Completed hours</h4>
      <div style={{ width: 400, height: 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={completedWorkByMember}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {completedWorkByMember.map((entry, index) => (
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
    </>
  );
};
