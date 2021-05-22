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

## manage ao
npm run remove <name>
npm run activate <name>
npm run deactivate <name>
```

### ao

So you want to be an ao? Or you're just confused? It's understandable.

This century (1970-2070) is the end of the Industrial age and the beginning of the Information age. This generation, like it or not, is the author of that transition. Our choices now will create the new characteristics of human power and will determine if the semiconductor ultimately realized or destroyed liberty.  

Ultimately scarcity is the reality of existence and the biggest problem faced by societies. There is a limited capacity for food, fresh water, industrial production, ... everything. The most successful solution to this problem has been money, not because there is anything inherently good about it, but because it functions as a conduit of information.  

Every political paper money in history has gone to zero. The Faustian arrangement between politicians and bankers to create risk free securities has only one catastrophic end. Systems that perpetuate wealth without creating value are unethical and ultimately *doomed*, *dooomed*.  

top right shows current status of bitcoind and lightningd including current on chain fee conditions and channel balances.

top left shows created user accounts on the current server. These are the aliases of those that can create and receive the content.

All addresses and invoices go directly to lightning wallet with root private key file `~/.lightning/bitcoin/hsm_secret`.

Autopilot will deploy all funds into channels.  

Once value is on the device treat it accordingly.

Recommend new hardware, safe location.  
