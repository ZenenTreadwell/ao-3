AO is a meta-project, the goal is to get people to control their own hardware, control their own data, communicate directly with eachother, and leverage the power of open source protocals.   

To start you need to install Linux onto a computer, laptop, or [mini-board](https://www.hardkernel.com/shop/odroid-c4/). Once you have an install of Manjaro, Ubuntu or Raspbian you can use the ao setup wizard which will install: tor, bitcoin, lightning and ao and configure them all to startup on boot.   
```
git clone https://github.com/AutonomousOrganization/ao-3.git
cd ao-3/setup && ./wizard.sh
```
Check out localhost:8003 to start using ao. Use bitcoin-cli & lightning-cli to control your nodes. It is your responsibility to understand the [backup process](https://lightning.readthedocs.io/BACKUP.html). 

For devs it's a Vue single page app (src/App.vue) with an Express server (src/server/app.js). The database (~/.ao/database.sqlite3) is a single table: events.  

```
# Nodejs 
git clone https://github.com/AutonomousOrganization/ao-3 && cd ao-3
npm install
npm run build #bundle App.vue
npm start #serve bundle and start api
```
### Autonomous Organization

AO is an recursive notepad, todo list, and calendar. AO reflects you.  

AO creates an [onion](https://www.torproject.org/download/) so others can interact directly with you.

AO participates in an open public money network (lightning) that improves on Bitcoin's weaknesses: scalability, speed, and privacy.

AO can be extended to control [Raspberry Pi's](https://github.com/AutonomousOrganization/pi) i.e. vending machine, electronic lock...


