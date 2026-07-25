#!/usr/bin/env sh
set -eu

staged=$(git diff --cached --name-only --diff-filter=ACM)
[ -z "$staged" ] && exit 0

fail=0

for file in $staged; do
  case "$file" in
    *.env.example) ;;
    .env|*/.env|*.env|.env.*|*/.env.*)
      echo "BLOCKED: $file is an env file and must never be committed."
      fail=1
      ;;
  esac
done

patterns='-----BEGIN[A-Z ]*PRIVATE KEY-----
ghp_[A-Za-z0-9]{36}
github_pat_[A-Za-z0-9_]{60,}
gho_[A-Za-z0-9]{36}
AKIA[0-9A-Z]{16}
sk-[A-Za-z0-9]{32,}
xox[baprs]-[A-Za-z0-9-]{10,}'

for file in $staged; do
  [ -f "$file" ] || continue
  case "$file" in
    scripts/check-secrets.sh) continue ;;
  esac
  if echo "$patterns" | grep -q . && printf '%s\n' "$patterns" | while IFS= read -r pattern; do
    [ -z "$pattern" ] && continue
    if grep -qE "$pattern" "$file" 2>/dev/null; then
      exit 1
    fi
  done; then
    :
  else
    echo "BLOCKED: $file contains what looks like a credential."
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "Commit refused. Move the value into an env var and add the key to"
  echo "server/.env.example. If this is a false positive, rerun with --no-verify"
  echo "and say so in the PR description."
  exit 1
fi

exit 0
