interface TypingIndicatorProps {
  names: string[];
}

/** Turn a list of typists into a readable sentence. */
function describe(names: string[]): string {
  if (names.length === 1) {
    return `${names[0]} is typing…`;
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]} are typing…`;
  }

  return "Several people are typing…";
}

/**
 * Always occupies its line, even when empty, so the message list does not jump
 * up and down as people start and stop typing.
 */
const TypingIndicator = ({ names }: TypingIndicatorProps) => (
  <p
    aria-live="polite"
    className="h-5 px-6 text-xs italic text-slate-500"
  >
    {names.length > 0 ? describe(names) : ""}
  </p>
);

export default TypingIndicator;
