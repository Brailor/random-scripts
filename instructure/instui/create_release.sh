#!/bin/bash

# This script should be run from the root of the instui git worktree directory.
read -p "v8 or v7 release?: " release_number

curr_time="$(date -u  +%Y-%m-%d)"
worktree_name="${release_number}-release"
branch_name="${worktree_name}-${curr_time}"

echo "Creating git worktree..."
git worktree add "$worktree_name" -b "$branch_name"
echo "Worktree done, navigating into it.."
cd "$worktree_name"
echo "Running yarn install..."
yarn 1> /dev/null
echo "Running yarn bootstrap..."
yarn bootstrap 1> /dev/null
osascript -e "display notification \"Bootstrap for branch: $branch_name is completed!\" with title \"Bootstrap completed!\""
echo "Bumping packages..."
yarn bump
