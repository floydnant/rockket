#!/usr/bin/env bash

# Set the owner and repository name
owner="dein-ding"
repo="todo-app"

# Get the pull request number from the command line argument
pull_number=$1

# Send the GET request to the GitHub API
response=$(curl -s -X GET https://api.github.com/repos/$owner/$repo/pulls/$pull_number -H "Accept: application/vnd.github+json")

# Use a jq filter to check if the 'dependencies' label exists
output=$(echo "$response" | jq '.labels | map(select(.name == "dependencies")) | length')

# Check the output and exit with the appropriate exit code
if [ "$output" -eq 0 ]; then
    exit 1
else
    exit 0
fi
