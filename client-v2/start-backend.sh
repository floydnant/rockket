cd ../server

db_url=$(bash ./get-testing-db-url.sh)

DATABASE_URL=$db_url npm run db:reset
DATABASE_URL=$db_url $1