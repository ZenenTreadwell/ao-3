if  test -f ../configuration.js; then
    echo 'configuration.js exists'
else
    cp ./sample_configuration.js ../configuration.js
fi

if  test -f $HOME/.bitcoin/bitcoin.conf; then
    echo 'bitcoin.conf exists'
else
    cp ./sample_bitcoin.conf $HOME/.bitcoin/bitcoin.conf
    echo 'created sample bitcoin config'
fi

if  test -f $HOME/.lightning/config; then
    echo 'lightning config exists'
else
    cp ./sample_lightning_config $HOME/.lightning/config
    echo 'created sample lightning config'
fi

if  test -f $HOME/.ao/key; then
    echo 'ao privkey exists'
else
    node ./createPrivateKey.js >> $HOME/.ao/key
    echo 'created ao key'
fi
