import React from "react";
import { NavLink } from "react-router-dom";
import { getIteration, getIterations } from "../data/api/iterations.js";
import { IterationSelector } from "./iteration-selector.js";
import { useMemo } from "react";
import { useIterationsStore } from "../data/iterations-store.js";
import { useIterationStore } from "../data/iteration-store.js";
import { IterationsPicker } from "./iterations-picker.js";

export interface IterationsLayoutProps {
  children: ReactNode;
  teamId: string;
  iterationId?: string;
}

export type IterationSelectorType = {
  name: string;
  subgroups: {
    name: string;
    iterations: Array<{
      id: string;
      name: string;
      path: string;
      startDate: string;
      finishDate: string;
      url: string;
      current: boolean;
    }>;
  }[];
};

export function IterationsLayout({
  children,
  teamId,
  iterationId,
}: IterationsLayoutProps) {
  const { iterations, lastUpdated } = useIterationsStore(
    (state) => state,
  );
  const { data } = useIterationStore((state) => state);

  const breakdown: IterationSelectorType[] = useMemo(() => {
    if (!iterations) return [] as IterationSelectorType[];

    let output: IterationSelectorType[] = [];

    iterations.forEach((iteration) => {
      const iterationPathParts = iteration.path.split("\\");
      const iterationGroupName =
        iterationPathParts[iterationPathParts.length - 3];
      const iterationGroupSubname =
        iterationPathParts[iterationPathParts.length - 2];
      const iterationName = iterationPathParts[iterationPathParts.length - 1];

      let foundGroup = output.find((g) => g.name === iterationGroupName);
      let group = foundGroup ?? { name: iterationGroupName, subgroups: [] };

      let foundSubgroup = group.subgroups.find(
        (sg) => sg.name === iterationGroupSubname,
      );
      let subgroup = foundSubgroup ?? {
        name: iterationGroupSubname,
        iterations: [],
      };

      subgroup.iterations.push({
        id: iteration.id,
        name: iterationName,
        path: iteration.path,
        startDate: iteration.attributes.startDate,
        finishDate: iteration.attributes.finishDate,
        url: iteration.url,
        current: data ? data.path === iteration.path : false,
      });

      if (!foundSubgroup) {
        group.subgroups.push(subgroup);
      }

      if (!foundGroup) {
        output.push(group);
      }
    });

    return output;
  }, [data, iterations]);

  return (
    <>
      <div className="font-sans text-center align-middle border-b-2 border-gray-600 pt-2 mb-4">
        <IterationsPicker teamId={teamId} />
        {/* <IterationSelector teamId={teamId} iterations={breakdown} iterationId={iterationId} /> */}
        <div className="w-full text-left pl-8">
          <NavLink to={`/teams`}>&lt; Back to team selection</NavLink>
        </div>
      </div>
      <div>{children}</div>
    </>
  );
}
