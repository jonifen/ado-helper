import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWorkItemStore } from "../../data/workitem-store.js";

const MAX_ID_LENGTH = 8;

export function WorkItemsSearch() {
  const [input, setInput] = useState("");
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const { data, loading, error, loadWorkItem } = useWorkItemStore(
    (state) => state,
  );

  useEffect(() => {
    document.title = "Work Items (ADO Helper)";
    return () => {
      document.title = "ADO Helper";
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value.replace(/\D/g, "").slice(0, MAX_ID_LENGTH));
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!input) return;
    const id = Number(input);
    setSubmittedId(id);
    loadWorkItem(id);
  };

  return (
    <div className="font-sans items-center justify-items-center min-h-screen px-8 pb-3">
      <div className="flex flex-col gap-3 max-w-full">
        <h2 className="text-2xl font-bold">Work Items</h2>
        <p className="text-sm max-w-xl">
          Enter a work item ID below and click Search to look up its title
          and current iteration. Click the ID in the result to open the full
          work item details, including its parent, children, description and
          acceptance criteria.
        </p>

        <form
          onSubmit={handleSearch}
          className="flex flex-row gap-2 items-center"
        >
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={MAX_ID_LENGTH}
            value={input}
            onChange={handleChange}
            placeholder="e.g. 12345"
            className="border border-slate-600 p-2 w-48"
          />
          <button
            type="submit"
            disabled={!input}
            className="px-2 py-1 border border-teal-500 text-teal-500 text-sm rounded hover:bg-teal-500 hover:text-black transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-teal-500"
          >
            Search
          </button>
        </form>

        {loading && <div className="text-sm">Loading</div>}

        {!loading && error && submittedId !== null && (
          <p className="text-sm text-red-500">
            Error loading work item {submittedId}: {error}
          </p>
        )}

        {!loading && !error && submittedId !== null && data && (
          <div className="border-1 border-[#16292B] rounded-md p-2 text-sm bg-[#1B3336] shadow-md max-w-xl flex flex-row items-center gap-3">
            <div className="flex-1">
              <div>
                <strong>ID:</strong> {data.id}
              </div>
              <div>
                <strong>Title:</strong> {data.title}
              </div>
              <div>
                <strong>Iteration:</strong> {data.iterationPath || "N/A"}
              </div>
            </div>
            <Link
              to={`/workitems/${data.id}`}
              className="flex-0 px-2 py-1 border border-teal-500 text-teal-500 text-sm rounded hover:bg-teal-500 hover:text-black transition-colors text-nowrap"
            >
              View details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
