cd ../server

if [[ -z $GITHUB_ACTIONS ]];
    then source ./set-testing-db-url.sh;
    else bash ./set-testing-db-url.sh;
fi

npm run db:reset

$1