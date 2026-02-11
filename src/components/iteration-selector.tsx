import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import type { IterationSelectorType } from "./iterations-layout.js";

export function IterationSelector({
  teamId,
  iterationId,
  iterations,
}: {
  teamId: string;
  iterationId?: string;
  iterations: IterationSelectorType[];
}) {
  const today = new Date();

  const iterationMarkups = iterations.map((iteration) => (
    <div key={iteration.name} className="mb-4 text-center">
      <div className="flex flex-row justify-center flex-wrap">
        <h2 className="text-xl font-bold pt-4">{iteration.name}</h2>
        {iteration.subgroups.map((subgroup) => (
          <div
            key={subgroup.name}
            className="mb-2 [&:not(:last-child)]:border-r-1"
          >
            <h3 className="text-lg font-semibold">{subgroup.name}</h3>
            <div className="flex flex-row justify-center flex-wrap px-2">
              {subgroup.iterations.map((iter) => {
                const startDate = new Date(iter.startDate);
                const finishDate = new Date(iter.finishDate);
                finishDate.setHours(23, 59, 59, 0);
                const isCurrentSprint = startDate < today && finishDate > today;

                return (
                  <span
                    key={iter.id}
                    className={`
                      ${
                        isCurrentSprint
                          ? "border-1 border-green-100 dark:border-slate-600 px-2"
                          : "px-2"
                      }
                      rounded-md
                    `}
                  >
                    <NavLink
                      to={`/teams/${teamId}/iterations/${iter.id}`}
                      className="underline"
                      title={`Start: ${new Date(iter.startDate).toDateString()}, Finish: ${new Date(iter.finishDate).toDateString()}`}
                    >
                      {iter.name}
                    </NavLink>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  ));

  const [selectedIteration, setSelectedIteration] = useState({
    name: "FY25-26",
    markup: iterationMarkups.find((iteration) => iteration.key === "FY25-26"),
  });

  return (
    <>
      <div className="pb-2">
        {iterations.map((iteration, iterationIndex) => (
          <span
            key={iteration.name}
            className={`px-4 py-1 rounded-md cursor-pointer ${iteration.name === selectedIteration.name ? "bg-green-600" : ""}`}
            onClick={() =>
              setSelectedIteration({
                name: iteration.name,
                markup: iterationMarkups[iterationIndex],
              })
            }
          >
            {iteration.name}
          </span>
        ))}
      </div>
      {selectedIteration.markup}
    </>
  );
}
