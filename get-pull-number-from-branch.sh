#!/bin/bash

# The repository in the format 'OWNER/REPO'
repo='dein-ding/todo-app'
# The branch for which you want to get the pull request number
branch=$1

# Get the pull request number
pull_request_number=$(curl -s https://api.github.com/repos/$repo/pulls\?state\=all | jq ".[] | select(.head.ref == \"$branch\") | .number")

# Print the pull request number
echo $pull_request_number
