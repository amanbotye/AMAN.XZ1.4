#!/usr/bin/env bash
set -euo pipefail

# Script to permanently remove listed files from the repository history using git-filter-repo
# USAGE: Run this locally (not on GitHub Actions). Ensure you have a backup.

REPO_URL="https://github.com/amanbotye/AMAN.XZ1.4.git"
# If you prefer SSH, uncomment the next line and comment the HTTPS line above:
# REPO_URL="git@github.com:amanbotye/AMAN.XZ1.4.git"

python3 -m pip install --upgrade git-filter-repo

# Create a mirrored clone (contains all refs)
rm -rf AMAN.XZ1.4.git
git clone --mirror "$REPO_URL" AMAN.XZ1.4.git
cd AMAN.XZ1.4.git

# Use the supplied remove-paths.txt if present in the repo root; otherwise expect it in current dir
if [ -f "../remove-paths.txt" ]; then
  cp ../remove-paths.txt ./remove-paths.txt
fi

# Run git-filter-repo to remove the listed paths from all commits
git filter-repo --invert-paths --paths-from-file remove-paths.txt

# Cleanup and aggressive GC
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force-push rewritten history back to GitHub (destructive)
# WARNING: This rewrites history. All collaborators must re-clone after this.

git push --force --mirror "$REPO_URL"

echo "DONE: repository history rewritten and pushed. Inform collaborators to re-clone."
