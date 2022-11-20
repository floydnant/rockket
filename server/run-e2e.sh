# if [[ -z $GITHUB_ACTIONS ]];
#     then source ./set-testing-db-url.sh;
#     else bash ./set-testing-db-url.sh;
# fi

db_url=$(bash ./set-testing-db-url.sh)

DATABASE_URL=$db_url npm run db:reset

echo ''
echo '> Now running e2e tests'
echo "> jest $1"
echo ''
DATABASE_URL=$db_url jest $1