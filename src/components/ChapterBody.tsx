"use client";

import { readerBodyClass, useReaderPrefs } from "@/components/ReadingSettings";

interface ChapterBodyProps {
  html: string;
}

export function ChapterBody({ html }: ChapterBodyProps) {
  const prefs = useReaderPrefs();

  return (
    <div
      className={readerBodyClass(prefs)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
