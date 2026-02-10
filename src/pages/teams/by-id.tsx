import React from "react";
import { useParams } from "react-router-dom";

type TeamByIdType = {
  id: string;
};

export function TeamById({ id }: TeamByIdType) {
  return <div>Team</div>;
}
