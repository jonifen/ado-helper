import React, { useMemo } from "react";
import type { IterationsValueType } from "../data/api/iterations-types.js";
import { NavLink } from "react-router-dom";

type PathNode = {
  name: string;
  id?: string;
  path?: string;
  url?: string;
  children?: PathNode[];
};

function buildTree(
  teamId: string,
  iterations: IterationsValueType[],
): PathNode[] {
  const root: PathNode[] = [];

  iterations.forEach((iteration) => {
    const parts = iteration.path.split("\\");
    let currentLevel = root;

    parts.forEach((part, idx) => {
      let node = currentLevel.find((n) => n.name === part);
      if (!node) {
        node = { name: part };
        if (idx < parts.length - 1) node.children = [];
        if (idx === parts.length - 1) {
          node.id = iteration.id;
          node.path = iteration.path;
          node.url = `/teams/${teamId}/iterations/${iteration.id}`;
        }
        currentLevel.push(node);
      }
      if (node.children) currentLevel = node.children;
    });
  });

  return root;
}

export function IterationsPicker({
  iterations,
  teamId,
}: {
  iterations: IterationsValueType[];
  teamId: string;
}) {
  const tree = useMemo(() => {
    if (!iterations) return [] as PathNode[];
    return buildTree(teamId, iterations);
  }, [iterations, teamId]);

  const currentSprint = useMemo(() => {
    const today = new Date();
    return iterations.find((iteration) => {
      const startDate = new Date(iteration.attributes.startDate);
      const finishDate = new Date(iteration.attributes.finishDate);
      finishDate.setHours(23, 59, 59, 0);
      return startDate < today && finishDate > today;
    });
  }, [iterations]);

  const AccordionNode: React.FC<{ node: PathNode }> = ({ node }) => {
    const [open, setOpen] = React.useState(false);
    if (node.children) {
      return (
        <div key={node.name}>
          <button
            className="w-full text-left p-2 font-semibold bg-gray-800 text-gray-100 border border-gray-700 rounded cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={() => setOpen((o) => !o)}
          >
            {node.name} {open ? "▼" : "►"}
          </button>
          {open && (
            <div className="ml-4 border-l border-gray-700 pl-2">
              {node.children.map((child) => (
                <AccordionNode
                  key={child.name + (child.id || "")}
                  node={child}
                />
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <NavLink
          to={node.url}
          key={node.name + (node.id || "")}
          className="block p-2 bg-gray-900 text-gray-100 hover:bg-gray-700 border border-gray-700 rounded-lg mr-2 last:mr-0 ml-4 transition-colors"
        >
          {node.name}
        </NavLink>
      );
    }
  };

  return (
    <div className="w-full flex gap-2">
      <div className="flex-1">
        {tree.map((node) => (
          <AccordionNode key={node.name + (node.id || "")} node={node} />
        ))}
      </div>
      {currentSprint && (
        <NavLink to={`/teams/${teamId}/iterations/${currentSprint.id}`} className="text-2xl p-1 h-10">📆</NavLink>
      )}
    </div>
  );
}
