import React from "react";
import { parseRichTextSections } from "../utils/rich-text-sections.js";

export function RichTextSections({
  html,
  emptyLabel,
}: {
  html: string;
  emptyLabel: string;
}) {
  const sections = parseRichTextSections(html);

  if (sections.length === 0) {
    return <i className="text-sm">{emptyLabel}</i>;
  }

  return (
    <div className="flex flex-col gap-2">
      {sections.map((section) => (
        <div
          key={section.id}
          className="border-1 border-[#16292B] rounded-md bg-[#1B3336] shadow-md p-2"
        >
          {section.heading && (
            <h4 className="text-base font-bold mb-1">{section.heading}</h4>
          )}
          <div
            className="ado-rich-text text-sm"
            dangerouslySetInnerHTML={{ __html: section.html }}
          />
        </div>
      ))}
    </div>
  );
}
