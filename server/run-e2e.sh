source ./set-testing-db-url.sh

npm run db:reset

echo ''
echo '> Now running e2e tests'
echo "> jest $1"
echo ''
jest $1