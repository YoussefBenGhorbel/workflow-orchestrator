#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/YoussefBenGhorbel/workflow-orchestrator.git"

echo "== workflow-orchestrator push script (bash) =="

# go to repo root (script may be called from anywhere)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

echo "Repo root: $REPO_ROOT"

# Safety cleanup
rm -rf node_modules backend/node_modules frontend/node_modules frontend/frontend/node_modules || true
rm -f .env backend/.env frontend/.env || true

# Ensure .gitignore
if [ ! -f .gitignore ]; then
cat > .gitignore << 'EOF'
node_modules/
**/node_modules/
.env
.env.*
.DS_Store
dist/
build/
coverage/
EOF
echo "Created .gitignore"
fi

# Init git
if [ ! -d .git ]; then
  git init
  git branch -M main
  echo "Initialized git"
else
  git branch -M main >/dev/null 2>&1 || true
fi

# Remote
if ! git remote | grep -q '^origin$'; then
  git remote add origin "$REPO_URL"
  echo "Added remote origin: $REPO_URL"
else
  git remote set-url origin "$REPO_URL"
  echo "Updated remote origin: $REPO_URL"
fi

git add -A
git status

if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to commit."
else
  read -r -p "Commit message (default: Initial public backend): " MSG
  if [ -z "${MSG}" ]; then MSG="Initial public backend"; fi
  git commit -m "$MSG"
fi

git push -u origin main
echo "✅ Pushed to origin/main"

