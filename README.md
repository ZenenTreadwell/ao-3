
# ![Image of ao](/public/favicon-32x32.png) Autonomous Organization

## Philosophy
  - Embrace open source (OS)
  - OS operating systems are authentic control of hardware, the only true way to claim ownership of data.
  - OS networking, tor, enables connection without intermediaries able to tell the origin or the destination, the only true way to get online privacy.
  - OS money, bitcoin, cannot be counterfeited even by its creator or operators.
  - OS social, ao, hopefully the first of many.

barriers are low,
implications profound,
no time like now!?

## Intent
- connect inside new perspective [[¹]](https://duckduckgo.com/?q=inside+the+computer+zoolander+clip&t=canonical&ia=web)
- encourage full node validation and early lightning participation
- setup and control local hardware with pi pin integration  

## Install Instructions
From terminal

    git clone  https://github.com/AutonomousOrganization/ao-3.git
    cd ao-3
    npm install

Bundle [App.vue](/src/App.vue) interface

    npm run build
Run [app.js](/src/server/app.js) to start server

    npm start

[Install folder](/install) contains scripts to install dependencies
- **ubuntu** - operating system
- **nodejs** - server
- **sqlite3** - database
- **tor** - network
- **bitcoind & c-lightning** - wallet


    cd install
    chmod +x fullAoSetup.sh
    ./fullAoSetup.sh

## App
Ao is card inception, a window into a list of cards within cards within cards. Many can be viewing, adding to, and updating all at the same. If you see what you did, other people can see it too.
![Image of ui](/public/ui.png)
* top center, four dots to determine mode 1 - 4
* bottom center, create card within current
* (mode 1) create checklists
* (mode 2) set time, review history
* (mode 3) receive [sat](https://duckduckgo.com/?t=canonical&q=sat+bitcoin&ia=web)
* (mode 4) see accounts, settings

mode1
![Image of ui](/public/ui-todo.png)

card
![Image of ui](/public/ui-card.png)

## Dev Contact

AO at [45vkpxcawtv2ap3aw6v5pk4sd2j3flxuvev63uktywts7jvqtasejkid.onion](http://45vkpxcawtv2ap3aw6v5pk4sd2j3flxuvev63uktywts7jvqtasejkid.onion)

3AA6s5MUnLjPzi2iPzUGVqWGAGBBJnBiWg
