if [[ -z $TESTING_DATABASE_URL ]];
    then db_url=$(cat .env | grep 'TESTING' | sed 's/.*="\(.*\)"/\1/');
    if [[ -z $db_url ]]; then echo 'TESTING_DATABASE_URL not specified' && exit 1
    fi
    else db_url=$TESTING_DATABASE_URL;
fi;

echo $db_url