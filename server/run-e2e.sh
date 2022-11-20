if [[ -z $GITHUB_ACTIONS ]];
    then source ./set-testing-db-url.sh;
    else bash ./set-testing-db-url.sh;
fi

npm run db:reset

echo ''
echo '> Now running e2e tests'
echo "> jest $1"
echo ''
jest $1