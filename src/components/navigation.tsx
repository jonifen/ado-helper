import React from "react";
import { NavLink } from "react-router-dom";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Teams", path: "/teams" },
  { name: "Settings", path: "/settings" },
];

export function Navigation() {
  return (
    <div id="navigation" data-testid="navigation" className="w-full p-4 h-24 bg-gray-900 flex flex-col justify-center shadow-md">
      <div className="flex flex-row justify-between">
        <h2 className="text-2xl font-bold">ADO Helper</h2>
        <div>
          {navLinks.map((nl, idx) => {
            return (
              <React.Fragment key={nl.path}>
                {idx > 0 && <span className="text-gray-500"> | </span>}
                <NavLink to={nl.path} title={nl.name}>
                  {nl.name}
                </NavLink>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
