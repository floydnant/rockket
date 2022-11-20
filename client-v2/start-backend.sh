cd ../server

# if [[ -z $GITHUB_ACTIONS ]];
#     then source ./set-testing-db-url.sh;
#     else bash ./set-testing-db-url.sh;
# fi
db_url=$(bash ./set-testing-db-url.sh)

DATABASE_URL=$db_url npm run db:reset

DATABASE_URL=$db_url $1