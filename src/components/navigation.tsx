import React from "react";
import { NavLink } from "react-router-dom";

const navLinks = [
  { name: "Teams", path: "/teams" },
  { name: "Settings", path: "/settings" },
];

export function Navigation() {
  return (
    <div>
      ADO Helper
      {navLinks.map((nl) => {
        return (
          <React.Fragment key={nl.path}>
            {" | "}
            <NavLink to={nl.path} title={nl.name}>
              {nl.name}
            </NavLink>
          </React.Fragment>
        );
      })}
    </div>
  );
}
