import React from "react";
import { useLocation } from "react-router-dom";

export function NotFound() {
  const location = useLocation();

  return (
    <div>
      <p>No bueno, the page cannot be found</p>
      <code>{location.pathname}</code>
    </div>
  );
}
