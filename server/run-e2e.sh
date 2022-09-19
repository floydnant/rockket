DATABASE_URL="$(sh ./get-testing-db-url.sh $TESTING_DATABASE_URL)"; 
npm run db:reset 
jest $1