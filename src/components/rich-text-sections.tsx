import React, { useEffect, useRef } from "react";
import { parseRichTextSections } from "../utils/rich-text-sections.js";
import { getDevOpsBlobUrl } from "../data/api/ado-client.js";

export function RichTextSections({
  html,
  emptyLabel,
}: {
  html: string;
  emptyLabel: string;
}) {
  const sections = parseRichTextSections(html);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ADO's <img> tags point at its authenticated attachment API, which a
    // plain <img src> can't attach a PAT to — the request 401s and the
    // browser falls back to showing the alt text. Re-fetch each image with
    // the PAT and swap in a blob URL once it succeeds.
    const objectUrls: string[] = [];

    Array.from(container.querySelectorAll("img")).forEach((img) => {
      const originalSrc = img.getAttribute("src");
      if (
        !originalSrc ||
        originalSrc.startsWith("blob:") ||
        originalSrc.startsWith("data:")
      ) {
        return;
      }

      getDevOpsBlobUrl(originalSrc)
        .then((objectUrl) => {
          objectUrls.push(objectUrl);
          img.src = objectUrl;
        })
        .catch(() => {
          // Leave the original src in place; it'll render the same as it
          // did before this fetch was attempted.
        });
    });

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [html]);

  if (sections.length === 0) {
    return <i className="text-sm">{emptyLabel}</i>;
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
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
