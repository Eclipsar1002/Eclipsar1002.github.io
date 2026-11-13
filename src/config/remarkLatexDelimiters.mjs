// Normalize common LaTeX delimiters before Markdown treats their backslashes as
// escapes. Code samples and existing dollar-delimited math stay untouched.
export function normalizeMathDelimiters(source) {
  return source.replace(/(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:\n\1[^\n]*(?=\n|$)|$)|(`+)[^`]*?\2|\$\$[\s\S]*?\$\$|(?<!\\)\\\[([\s\S]*?)\\\]|(?<!\\)\\\(([^\n]*?)\\\)/g,
    (match, fence, code, display, inline) => {
      if (fence || code || match.startsWith('$$')) return match;
      return display !== undefined ? `\n\n$$\n${display.trim()}\n$$\n\n` : `$${inline.trim()}$`;
    });
}

export default function remarkLatexDelimiters() {
  const parser = this.parser;
  this.parser = (source, file) => parser(normalizeMathDelimiters(source), file);
}
