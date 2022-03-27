To install from scratch on a fresh Linux install like Manjaro, Ubuntu or Raspbian, you can use the setup/wizard script:  
```
cd setup && chmod +x wizard.sh && ./wizard.sh
```
This should get everything installed and running when the computer starts up. Check out localhost:8003 to see your ao. Use bitcoin-cli & lightning-cli to control your nodes. AO shows bitcoin addresses and lightning invoices that go into your local node. It is your responsibility to understand the [backup process](https://lightning.readthedocs.io/BACKUP.html). [Clboss](https://github.com/ZmnSCPxj/clboss) is optionally installed by the wizard and is recommended. It will automatically open and balance channels so you can just get started using lightning. 

For devs the frontend is a Vue single page app (src/App.vue) and the backend is an Express server (src/server/app.js). The database is by default at (~/.ao/database.sqlite3), it is a single table: events.  

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


