// @vitest-environment jsdom
import { render, fireEvent } from "@testing-library/react";
import { CsvDownloadButton } from "./csv-download-button.js";
import { describe, it, expect, vi } from "vitest";
import * as iterationManager from "../managers/iterations-manager.js";

vi.mock("../managers/iterations-manager.js", () => {
  return {
    getIterationDataCsv: vi.fn().mockResolvedValue("col1,col2\nval1,val2"),
  };
});

describe("CsvDownloadButton", () => {
  it("renders button", () => {
    const { getByText } = render(<CsvDownloadButton teamId="t1" iterationId="i1" />);
    expect(getByText(/Download CSV/i)).toBeTruthy();
  });

  it("calls download logic on click", async () => {
    window.Blob = vi.fn(() => ({}));
    window.URL.createObjectURL = vi.fn(() => "blob:url");
    const { getAllByText } = render(<CsvDownloadButton teamId="t1" iterationId="i1" />);
    fireEvent.click(getAllByText(/Download CSV/i)[0]);
    expect(iterationManager.getIterationDataCsv).toHaveBeenCalled();
  });
});
