if  test -f ../configuration.js; then
    echo 'configuration.js exists'
else
    cp ./sample_configuration.js ../configuration.js
fi
