db_url=$(bash ./sctipts/get-testing-db-url.sh)

DATABASE_URL=$db_url npx nx run rockket-backend:db:reset

echo ''
echo '> Now running e2e tests'
echo "> nx run $1"
echo ''
DATABASE_URL=$db_url nx run "$1"