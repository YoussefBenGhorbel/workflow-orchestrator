# scripts/push.ps1
# Run from repo root OR from scripts/ folder
# Example:
#   powershell -ExecutionPolicy Bypass -File .\scripts\push.ps1
#   powershell -ExecutionPolicy Bypass -File .\push.ps1   (if you're already in scripts/)

$ErrorActionPreference = "Stop"

$repoUrl = "https://github.com/YoussefBenGhorbel/workflow-orchestrator.git"

Write-Host "== workflow-orchestrator push script (PowerShell) =="

# Go to repo root if script executed from scripts/
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

Write-Host "Repo root: $repoRoot"

# Safety: remove node_modules and any .env before git add
$pathsToRemove = @(
  "node_modules",
  "backend/node_modules",
  "frontend/node_modules",
  "frontend/frontend/node_modules",
  ".env",
  "backend/.env",
  "frontend/.env"
)

foreach ($p in $pathsToRemove) {
  if (Test-Path $p) {
    Write-Host "Removing $p"
    Remove-Item -Recurse -Force $p
  }
}

# Ensure .gitignore exists
if (-not (Test-Path ".gitignore")) {
@"
node_modules/
**/node_modules/
.env
.env.*
.DS_Store
dist/
build/
coverage/
"@ | Out-File -Encoding utf8 ".gitignore"
  Write-Host "Created .gitignore"
}

# Init git if missing
if (-not (Test-Path ".git")) {
  git init | Out-Null
  git branch -M main
  Write-Host "Initialized git"
} else {
  # Ensure main branch name
  git branch -M main | Out-Null
}

# Configure remote
$remotes = git remote 2>$null
if ($remotes -notmatch "origin") {
  git remote add origin $repoUrl
  Write-Host "Added remote origin: $repoUrl"
} else {
  git remote set-url origin $repoUrl
  Write-Host "Updated remote origin: $repoUrl"
}

# Stage changes
git add -A
git status

# Commit (only if there are changes)
$hasChanges = (git status --porcelain)
if ([string]::IsNullOrWhiteSpace($hasChanges)) {
  Write-Host "No changes to commit."
} else {
  $msg = Read-Host "Commit message"
  if ([string]::IsNullOrWhiteSpace($msg)) { $msg = "Initial public backend" }
  git commit -m "$msg" | Out-Null
  Write-Host "Committed."
}

# Push
git push -u origin main
Write-Host "✅ Pushed to origin/main"
