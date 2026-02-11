import React from "react";

export function CsvDownloadButton({ teamId, iterationId }: { teamId: string; iterationId: string }) {
  function handleDownloadCsv() {
    const url = `/api/iteration-csv?teamId=${encodeURIComponent(teamId)}&iterationId=${encodeURIComponent(iterationId)}`;
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `iteration-${teamId}-${iterationId}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }

  return (
    <button
      type="button"
      className="ml-3 mt-2 px-2 py-1 bg-green-700 text-white text-sm rounded hover:bg-green-800"
      onClick={handleDownloadCsv}
    >
      Download CSV
    </button>
  );
}
