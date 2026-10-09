#!/usr/bin/env bash
# spike.sh — file-snapshot checkpoint/revert for the `spike` skill.
#
# Snapshots are plain copies of your tracked + untracked source files into
# .git/spike-snapshots/<id>/. Reverting restores a snapshot. The tool NEVER
# commits, never stashes, never moves your HEAD or staging — committing is
# yours alone. .gitignored files (node_modules, build output) are never
# touched; .git/ itself is never touched.
set -euo pipefail

die() { echo "spike: $*" >&2; exit 1; }

root="$(git rev-parse --show-toplevel 2>/dev/null)" || die "not a git repo"
cd "$root"
snaps=".git/spike-snapshots"

# The exact set of files a spike owns: tracked + untracked-but-not-ignored.
spike_files() { git ls-files --cached --others --exclude-standard -z; }

cmd="${1:-}"; shift || true
case "$cmd" in
  checkpoint)
    # Snapshot the working tree before a route, keyed by id (use the frame label).
    id="${1:-}"; [ -n "$id" ] || die "checkpoint needs an id (e.g. the frame label)"
    d="$snaps/$id"
    rm -rf "$d"; mkdir -p "$d"
    if [ "$(spike_files | tr -cd '\0' | wc -c)" -gt 0 ]; then
      spike_files | tar --null -T - -cf - | tar -xf - -C "$d"
    fi
    echo "checkpoint $id"
    ;;
  revert)
    # Erase the current spike files and restore the snapshot exactly.
    id="${1:-}"; [ -n "$id" ] || die "revert needs an id"
    d="$snaps/$id"; [ -d "$d" ] || die "no such checkpoint: $id"
    spike_files | xargs -0 rm -f 2>/dev/null || true
    tar -cf - -C "$d" . | tar -xf - -C "$root"
    echo "reverted to $id"
    ;;
  clean)
    # Drop all snapshots once the spike is done. Your working tree is untouched.
    rm -rf "$snaps"
    echo "removed $snaps"
    ;;
  *)
    die "usage: spike.sh {checkpoint <id> | revert <id> | clean}"
    ;;
esac
