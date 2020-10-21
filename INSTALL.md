## Install

Must create a configuration.js file like:
```
module.exports = {
    openAo: true,
    bitcoind: {
        username: '',
        password: ''
    },
    sqlite3: {
        file: '/home/taylor/.ao/database.sqlite3'
    },
    tor: {
    	hostname: '45vkpxcawtv2ap3aw6v5pk4sd2j3flxuvev63uktywts7jvqtasejkid.onion'
    },
    clightning: {
        dir: '/home/taylor/.lightning/bitcoin'
    },
    bitcoinAverage: {
        pub: '',
        secret: ''
    },
    privateKey: '-----BEGIN EC PRIVATE KEY-----\n' +
    '-----END EC PRIVATE KEY-----\n'
}

```

Must install tor, bitcoind, clightning, sqlite3. Ubuntu script:
```
cd install
./install.sh
```
Recommend reading the scripts and running in terminal or following the instructions from individual projects.

plz 3AA6s5MUnLjPzi2iPzUGVqWGAGBBJnBiWg
