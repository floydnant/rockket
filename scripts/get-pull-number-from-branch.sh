#!/bin/bash

# The repository in the format 'OWNER/REPO'
repo='floydnant/rockket'
# The branch for which you want to get the pull request number
branch=$1

# retrieve the pull request information for the specified branch
response=$(curl -s "https://api.github.com/repos/$repo/pulls")

# check if the API returned a valid response
if [ $? -ne 0 ]; then
    echo "Error: Failed to retrieve information from the API."
    exit 1
fi

# We chould have just went with `jq`, but railway decided not to provide that tool
# pull_request_number=$($response | jq ".[] | select(.head.ref == \"$branch\") | .number")
# echo $pull_request_number

# So we'll need to go with js
echo $response >> tmp.txt
pull_request_number=$(node -e "
    const fs = require('fs')
    const resRaw = fs.readFileSync('./tmp.txt', 'utf-8')
    const res = JSON.parse(resRaw)

    const pullNumber = res.find(pr => pr.head.ref == '$branch').number
    console.log(pullNumber)
")
rm ./tmp.txt

# check if the pull request number was found
if [ -z "$pull_request_number" ]; then
    echo ""
    echo "Error:_Pull_request_for_the_branch_not_found."
    exit 1
else
    # print the pull request number
    echo "$pull_request_number"
    exit 0
fi
