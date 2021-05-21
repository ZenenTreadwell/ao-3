```
## Ubuntu 20 / Debian One Shot
wget https://raw.githubusercontent.com/AutonomousOrganization/ao-3/master/install/fresh-setup.sh
chmod +x fresh-setup.sh
sudo ./fresh-setup.sh

## nodejs
git clone https://github.com/AutonomousOrganization/ao-3
cd ao-3
npm install
npm run setup
npm run checkconfig
npm run build
npm start
```

#### ao

ao bull top right shows current status of bitcoind and lightningd including current on chain fee conditions and channel balances.

ao doge top left shows created user accounts on the current ao server.

All addresses and invoices go directly to lightning wallet with root private key file `~/.lightning/bitcoin/hsm_secret`.

Autopilot will deploy all funds into channels.  

Once value is on the device treat it accordingly. Recommend new hardware, safe location.  
