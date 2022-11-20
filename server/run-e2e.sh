if [[ $GITHUB_ACTIONS == 'true' ]]
    then bash ./set-testing-db-url.sh
    else source ./set-testing-db-url.sh
fi

npm run db:reset

echo ''
echo '> Now running e2e tests'
echo "> jest $1"
echo ''
jest $1