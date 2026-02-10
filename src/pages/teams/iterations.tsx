import React from "react";
import { useParams } from "react-router-dom";

export function TeamIterations() {
  const { teamId, iterationId } = useParams<{ teamId: string; iterationId: string }>();
  if (!teamId || !iterationId) return null;

  return <div>Team iteration</div>;
}
