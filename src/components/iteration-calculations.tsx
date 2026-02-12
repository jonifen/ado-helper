import React from "react";
import type {
  IterationDataResourceType,
  IterationWorkItemsType,
} from "../managers/iterations-manager-types.js";

export const IterationCalculations = ({
  resource,
  workItems,
  sprintEndDate,
}: {
  resource: IterationDataResourceType;
  workItems: IterationWorkItemsType[];
  sprintEndDate: Date;
}) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold">Calculations</h2>
      <i className="text-xs">
        Note: Calculations are as per midnight this morning and do not track
        progress throughout the day. <strong>All values are in hours.</strong>
      </i>
      <table className="table table-auto text-sm bg-[#1B3336] border border-slate-600">
        <thead>
          <tr>
            <th rowSpan={2}>Member</th>
            <th colSpan={4}>Absence</th>
            <th colSpan={3}>Capacity</th>
            <th colSpan={3}>Workload</th>
            <th rowSpan={2}>Delta</th>
          </tr>
          <tr>
            <th>Dates</th>
            <th>Personal</th>
            <th>Team</th>
            <th>Total</th>
            <th>Daily</th>
            <th>Total</th>
            <th>Remaining</th>
            <th>Estimated</th>
            <th>Remaining</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {resource.members.map((member, memberIndex) => {
            const teamAbsenceHours =
              resource.team.capacity.absence.totals.days *
              member.capacity.dailyHours;

            const totalAbsenceHours =
              member.capacity.absence.totals.hours + teamAbsenceHours;

            const absenceHours =
              member.capacity.absence.totals.hours + teamAbsenceHours;
            const totalCapacity =
              member.capacity.dailyHours * member.capacity.iterationLength -
              absenceHours;

            const remainingCapacity =
              member.capacity.availableDaysRemaining *
              member.capacity.dailyHours;
            const remainingWorkloadIsGreaterThanRemainingCapacity =
              member.workload.totalRemaining > remainingCapacity;

            return (
              <tr
                key={member.id}
                className={`${memberIndex % 2 === 0 ? "bg-[#23474A]" : ""} text-right`}
              >
                <td className="text-left w-36">{member.name}</td>
                <td className="text-left w-36">
                  <ul>
                    {member.capacity.absence.dates.map((dayOff) => (
                      <li key={`${member.id}-${dayOff.valueOf()}`}>
                        &middot; {dayOff.toDateString()}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="w-24">{member.capacity.absence.totals.hours}</td>
                <td className="w-24">{teamAbsenceHours}</td>
                <td className="w-24">{totalAbsenceHours}</td>
                <td className="w-24">{member.capacity.dailyHours}</td>
                <td className="w-24">{totalCapacity}</td>
                <td className="w-24">{remainingCapacity}</td>
                <td className="w-24">{member.workload.totalEstimated}</td>
                <td className="w-24">
                  {remainingWorkloadIsGreaterThanRemainingCapacity && (
                    <span
                      className="cursor-default"
                      title={`Remaining work is greater than remaining capacity. Difference is ${member.workload.totalRemaining - remainingCapacity} hrs.`}
                    >
                      ⚠️{" "}
                    </span>
                  )}
                  {member.workload.totalRemaining}
                </td>
                <td className="w-24">{member.workload.totalCompleted}</td>
                <td
                  className={`${
                    member.workload.timeDelta < 0
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
                  } w-24`}
                >
                  {member.workload.timeDelta > 0
                    ? `+${member.workload.timeDelta}`
                    : member.workload.timeDelta}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="text-sm">
        <h3 className="text-lg font-bold">Team absence dates</h3>
        <ul>
          {resource.team.capacity.absence.dates.map((dayOff) => (
            <li key={`${resource.team.id}-${dayOff.valueOf()}`}>
              &middot; {dayOff.toDateString()}
            </li>
          ))}
          {resource.team.capacity.absence.dates.length === 0 && (<li className="italic text-gray-400">No team absences</li> )}
        </ul>
      </div>
    </div>
  );
};
