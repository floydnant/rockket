#!/usr/bin/env bash

author=$(git log -1 --pretty=format:"%an")

echo "Author of the last commit: $author"

# Check if the author is "dependabot[bot]"
if [ "$author" == "dependabot[bot]" ]; then
    echo "Author is dependabot[bot]. Exiting with code 0."
    exit 0
fi

# Set the owner and repository name
repo="floydnant/rockket"

# Get the pull request number from the command line argument
pull_number=$1

# Send the GET request to the GitHub API
response=$(curl -s -X GET "https://api.github.com/repos/$repo/pulls/$pull_number" -H "Accept: application/vnd.github+json")

# Use a jq filter to check if the 'dependencies' label exists
output=$(echo "$response" | jq '.labels | map(select(.name == "dependencies")) | length')

# Check the output and exit with the appropriate exit code
if [ "$output" -eq 0 ]; then
    echo "PR has dependencies label. Exiting with code 0."
    exit 0
else
    exit 1
fi
