#!/bin/bash
# Wiki SessionStart hook — injects wiki awareness into every session.
# Outputs markdown that gets added to Claude's context.
# CRITICAL: outputs NOTHING if wiki/ doesn't exist. The plugin must be
# completely invisible in projects that haven't opted in.

WIKI_DIR="wiki"

# No wiki in this project — stay completely silent
if [ ! -d "$WIKI_DIR" ]; then
  exit 0
fi

echo "## Project Wiki"
echo ""
echo "This project has a knowledge base at \`wiki/\`. It contains decisions, patterns, and architectural insights captured from previous work."
echo ""

# List topics (folder names with entry counts)
echo "### Topics"
for dir in "$WIKI_DIR"/*/; do
  [ -d "$dir" ] || continue
  dirname=$(basename "$dir")
  # Skip hidden dirs
  [[ "$dirname" == .* ]] && continue
  count=$(find "$dir" -name "*.md" -not -name "README.md" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -gt 0 ]; then
    echo "- **$dirname/** ($count entries)"
  fi
done

echo ""
echo "### How to use"
echo "- **Search**: Use the \`wiki_search\` MCP tool to find relevant context, or run \`/wiki:ask <question>\`."
echo "- **Capture**: Run \`/wiki:cognite\` to save decisions and insights from the current work."
echo "- **Plans**: When writing implementation plans, include a final step: \`Run /wiki:cognite to capture decisions from this work.\`"
echo ""
echo "Search the wiki proactively when starting work in an unfamiliar area."
