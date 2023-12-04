cd ../

db_url=$(bash ./scripts/get-testing-db-url.sh)

DATABASE_URL=$db_url npx nx run rockket-backend:db:reset
DATABASE_URL=$db_url $1