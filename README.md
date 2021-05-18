```
## Ubuntu 20 / Debian
wget https://github.com/AutonomousOrganization/ao-3/blob/master/install/fresh-setup.sh | bash

git clone https://github.com/AutonomousOrganization/ao-3
cd ao-3
npm install
npm run setup
npm run checkconfig
npm run build
npm start
```

#### ao

ao bull top right shows current status of bitcoind and lightningd including current on chain fee conditions and channel balance.

ao doge top left shows created user accounts.

All addresses and invoices go directly to lightning wallet with root private key file `~/.lightning/bitcoin/hsm_secret`.

Autopilot will deploy all funds into channels.  

Once value is on the device treat it accordingly. Recommend new hardware, safe location.  
