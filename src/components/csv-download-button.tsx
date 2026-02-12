import React from "react";
import { getIterationDataCsv } from "../managers/iterations-manager.js";

export function CsvDownloadButton({ teamId, iterationId }: { teamId: string; iterationId: string }) {
  async function handleDownloadCsv() {
    try {
      const csv = await getIterationDataCsv();
      const blob = new Blob([csv], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `iteration-${teamId}-${iterationId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to generate CSV: " + (err instanceof Error ? err.message : err));
    }
  }

  return (
    <button
      type="button"
      className="ml-3 mt-2 px-2 py-1 border border-green-500 text-green-500 text-sm rounded hover:bg-green-500 hover:text-black transition-colors"
      onClick={handleDownloadCsv}
    >
      Download CSV
    </button>
  );
}
