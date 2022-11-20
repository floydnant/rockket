cd ../server

if [[ $GITHUB_ACTIONS = 'true' ]]
    then bash ./set-testing-db-url.sh
    else source ./set-testing-db-url.sh
fi

npm run db:reset

$1