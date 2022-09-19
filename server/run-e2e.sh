if [[ -z $TESTING_DATABASE_URL ]];
    then DATABASE_URL=$(cat .env | grep 'TESTING' | sed 's/.*="\(.*\)"/\1/');
       if [[ -z $DATABASE_URL ]]; then echo 'TESTING_DATABASE_URL not specified' && exit 0
       fi
    else DATABASE_URL=$TESTING_DATABASE_URL;
fi;

npm run db:reset
jest $1