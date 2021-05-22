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
npm run createAccessKey
npm run link <onion> <access-key>
npm run unlink <onion>
```

### ao

So you want to be an ao? Or you're just confused? It's understandable.

This century (1970-2070) is the end of the Industrial age and the beginning of the Information age. This generation, like it or not, is the author of that transition. Our choices now will create the new characteristics of human power and will determine if the semiconductor ultimately realized or destroyed liberty.  

Ultimately scarcity is the reality of existence and the biggest problem faced by societies. There is a limited capacity for food, fresh water, industrial production, ... everything. The most successful solution to this problem has been money, not because there is anything inherently good about it, but because it functions as a conduit of information.  

Every political paper money in history has gone to zero. The Faustian arrangement between politicians and bankers to create risk free securities has only one catastrophic end. Systems that perpetuate wealth without creating value are unethical and ultimately *doomed*, *dooomed*.  

Bitcoin is a public money system with fixed supply. Its operation is decentralized; physical attempts to destroy it would fail. If adopted by a large amount of economic activity it will provide true market signals that can be used to make better decisions and open access to a store of value.

Autopilot will deploy all funds into the [lightning network](http://1ml.com). Channels are 2 of 2 contracts that benefit from being online so the intention once funds are put in should be to remain online.

Ao is an option to participate in Bitcoin in a way that will maximize your control and its usefulness. It validates the entire monetary system which takes a significant amount of time on first load; ~30 hours largely depending on hardware. Once up to date the cost of keeping up with the network is quite small.

Ao will create an onion that you can use to access from anywhere or advertise for others to access.

The top right shows the current on chain fee conditions and channel balances. It shows information directly from your nodes. The top left shows the aliases of those that have connected.

Ao is receive only. All payments go directly to the c-lightning wallet. C-lightning creates a root private key file `~/.lightning/bitcoin/hsm_secret` that you should copy and backup redundantly. If you want to spend any value you have accumulated use the `lightning-cli` command line tool (`close` & `withdraw` on chain or `pay` on lightning). Or you could use other wallet user interfaces for c-lightning like [spark](https://github.com/shesek/spark-wallet) or [qt](https://github.com/darosior/lightning-qt).

Once value is on the device treat it accordingly. Recovering from the hsm_seed is possible but requires channels to close and periods of anxiety.

Has been known to work on a raspberry pi but would recommend something with a little more oomph.

Ao divides reality into written vs done and if approached honestly could be useful in a process of self acknowledgment and growth.
