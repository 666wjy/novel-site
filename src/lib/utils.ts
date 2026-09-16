import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true });

export function renderMarkdown(content: string): string {
  return marked.parse(content) as string;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function cn(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
