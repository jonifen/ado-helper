import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function RepoSearch() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Repos (ADO Helper)";
    return () => {
      document.title = "ADO Helper";
    };
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    navigate(`/repos/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="font-sans items-center justify-items-center min-h-screen px-8 pb-3">
      <div className="flex flex-col gap-3 max-w-full">
        <h2 className="text-2xl font-bold">Repos</h2>
        <p className="text-sm max-w-xl">
          Enter a repository name below and click Search to view its details
          and commit activity.
        </p>

        <form
          onSubmit={handleSearch}
          className="flex flex-row gap-2 items-center"
        >
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. my-repo"
            className="border border-slate-600 p-2 w-64"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-2 py-1 border border-[#9CCB69] text-[#9CCB69] text-sm rounded hover:bg-[#9CCB69] hover:text-black transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#9CCB69]"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
