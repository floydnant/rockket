db_url=$(bash ./get-testing-db-url.sh)

DATABASE_URL=$db_url npm run db:reset

echo ''
echo '> Now running e2e tests'
echo "> jest $1"
echo ''
DATABASE_URL=$db_url jest $1