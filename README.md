AO is meant to help you take control of your own data & communication by using open source technology . You to have a computer with Linux, tor, bitcoind, lightningd. To install from scratch on a new Linux install like Manjaro, Ubuntu or Raspbian, you can use the setup/wizard script:  
```
cd setup && chmod +x wizard.sh && ./wizard.sh
```
This should get everything installed and running when the computer starts up. Check out localhost:8003 to see your ao. Using bitcoin-cli & lightning-cli to take control of your node. AO shows you bitcoin addresses and lightning payment requests that go into your local lightning node. It is your responsibility to understand the [backup process](https://lightning.readthedocs.io/BACKUP.html).

For developers ao-3 is a nodejs project with sqlite3 event store. The frontend is a Vue single page application and the backend is an Express server.
```
# Nodejs 
git clone https://github.com/AutonomousOrganization/ao-3
npm install
npm run build
npm start
```
### seeding autonomous organization

AO is an infinitely expanding recursive notepad, checklist and calendar. AO reflects you, purposely doesn't stimulate or prompt you.  

AO runs on Linux, it is owned & controlled by only you. You can share the tor onion and others can interact directly with you. Together you can expand ideas and work to realize them together. 

AO is participating fully and productively in an open public money system. Bitcoin is immune to politics. Lightning addresses bitcoin's largest weaknesses: scalability, speed, and privacy.

AO can be extended to control raspberry [pi's](https://github.com/AutonomousOrganization/pi) to bridge the digital world to the physical world i.e. vending machine, electronic lock...

Technology has often in history been the precursor to political and social revolution. The semiconductor all but guarantees the birth of a new political order. Will it be corpo-state techno fascism or human trancendent dogeism? Our generations choices will determine what is to come for humanity.
