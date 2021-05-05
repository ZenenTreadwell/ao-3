test server now located at
`bgb3uehhavyp5nkrbck24emfw2b6qaubdb4ax47bkjmtrcb32pp5byqd.onion`  

ao is a collaborative infinite notepad  

each note is a calendar, a checklist, a reciept list  

create an invoice in number of satoshis  

each note is held by usually one or more accounts  

view lightningd and bitcoind node information (bull) top right  

view accounts info (doge) top left  

manage preferences (gear) bottom right  

create notes middle center  

top right of note - place on checklist  

bottom left of note - remove from view  

bottom right of note - contents spring up to current  

top left of note - pin to front with short tag  

five stacks, five colors  

each stack can show all or pile up

each action is live updated to all

click on note - your reference becomes that note, new notes now go into it  

run via terminal, npm  

```
git clone https://github.com/AutonomousOrganization/ao-3
cd ao-3
npm install

## try to install bitcoind, lightningd, sqlite3, etc
npm run setup

## try to configure bitcoind, lightningd, tor, etc
npm run checkconfig

## build and start
npm run recompile

## build vue package  
npm run build

## start server
npm start
## terminal should log where ao can be reached, by default localhost:8003 and an onion
```

connect raspberry pi to trigger pins and read rfid tags via [run on pi](https://github.com/AutonomousOrganization/pi)

bugs, questions, insults, welcome anonymously at bgb3uehhavyp5nkrbck24emfw2b6qaubdb4ax47bkjmtrcb32pp5byqd.onion

generally I feel dubious about security within the node ecosystem. it is my honest belief that running this is safe, [my node](https://1ml.com/node/0337694505123a12a8fadd95523dcc235898ad3b80a06e4a63ca26fed68dd0d17c). ao is recieve only, for payments use `lightning-cli` pay/close/withdraw at the terminal or configure a wallet like [spark](https://github.com/shesek/spark-wallet). make sure to make one or several backups of the `hsm_secret` file which is root of all used private keys.

if configuration is unexpectedly successful a node autopilot called [clboss](https://github.com/ZmnSCPxj/clboss) will be active. it will open channels to well connected nodes and swap for incoming capacity. deploy any amount into the [lightning network](http://1ml.com) by depositing any amount of bitcoin. if the balance increases by a few dozen satoshis, its because your node forwarded a payment.  

good luck have fun
