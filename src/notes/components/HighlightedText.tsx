import classes from "./highlightedText.module.css";

type HighlightedTextProps = {
  text: string;
  query: string;
};

function splitByQuery(text: string, query: string): string[] {
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped ? text.split(new RegExp(`(${escaped})`, "gi")) : [text];
}

export function HighlightedText({ text, query }: HighlightedTextProps) {
  return (
    <>
      {splitByQuery(text, query).map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className={classes.mark}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
