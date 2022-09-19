if [[ -z $TESTING_DATABASE_URL ]];
    then db=$(cat .env | grep 'TESTING' | sed 's/.*="\(.*\)"/\1/');
       if [[ -z $DATABASE_URL ]]; then echo 'TESTING_DATABASE_URL not specified' && exit 0
       fi
    else db=$TESTING_DATABASE_URL;
fi;

DATABASE_URL=$db npm run db:reset
echo '' && echo "Now running e2e tests (jest $1)"
DATABASE_URL=$db jest $1