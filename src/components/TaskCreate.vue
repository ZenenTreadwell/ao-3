<template lang='pug'>

#createtask(ref="closeable")
  div.secondbackground#btnpanel
      div
          .gem(@click.stop='createOrFindTask'  :class='cardInputSty'  v-if='!showCreate')
              img(src='../assets/images/compose.svg')
          .boatContainer(v-else)
              button.clear(@click.stop='pileRecalled')
                  span(v-if='searchTotal > 0 && task.name.length > 0') recall &nbsp; {{ searchTotal }}
                  span(v-else) recall (-) 
                  span(v-if='showSearch') 
                      img(src='../assets/images/gear.svg').spin
              button.lock(@click='encryptIt = !encryptIt')
                  //label.switch(@click.stop)
                  //    input(type="checkbox"  v-model='encryptIt')
                  //    span.slider.round
              button.create(@click.stop='createOrFindTask'  :class='cardInputSty')
                  span create
      .cc(v-show='showCreate')
          textarea#card.paperwrapper(
              v-model='task.name'
              type='text'
              :class='cardInputSty'
              placeholder=""
              @keyup.enter.exact='createOrFindTask'
              @keydown.enter.exact.prevent
              row='10'
              col='20'
              @click.stop='tryGoIn'
          )
  span.hidden {{ refocusWatcher }}  {{ nameWatcher }}
  //- //"愛  любовь  عشق  love  사랑  Aşk  ਪਿਆਰ  အချစ်  ស្រឡាញ់  <3"

</template>

<script>

import calculations from '../calculations'
import Hammer from 'hammerjs'
import cryptoUtils from '../crypto'
import Current from './Current'

let searchDebounce = setTimeout(()=>{}, 123123123123123)
let focusBouncer = false


export default {
    data(){
        return {
            encryptIt: false,
            task: {
                name: '',
                color: 'blue',
            },
            swipeTimeout: 0,
            showSearch: false,
            matches: {
                doges: [],
                cards: [],
                guilds: []
            }
        }
    },
    components: {
        Current
    },
    mounted() {
        var el = document.getElementById('btnpanel')
        var mc = new Hammer.Manager(el)


        var Swipe = new Hammer.Swipe()
        let longPress = new Hammer.Press({ time: 400 })

        mc.add([Swipe, longPress])

        mc.on('swipeleft', () => {
            if(Date.now() - this.swipeTimeout > 100) {
                this.previousColor()
                this.swipeTimeout = Date.now()
            }
        });

        mc.on('swiperight', () => {
            if(Date.now() - this.swipeTimeout > 100) {
                this.nextColor()
                this.swipeTimeout = Date.now()
            }
        });

        mc.on('swipedown', () => {
            if(Date.now() - this.swipeTimeout > 100) {
                this.$store.commit('toggleCreate')
                this.swipeTimeout = Date.now()
            }
        });

        mc.on('swipeup', () => {
            if(Date.now() - this.swipeTimeout > 100) {
                this.$store.commit('toggleCreate')
                this.swipeTimeout = Date.now()
            }
        });
        window.addEventListener( "keydown", this.resetMaybe ) 
    },
    methods: {
        applyEvent(evn) {
            console.log({evn}) 
            if (evn.type === "task-created" && evn.name === this.task.name.trim){
                this.resetCard() 
            }
        },
        tryGoIn(){
            let hash = cryptoUtils.createCardHash(this.task.name)
            let card = this.$store.state.hashMap[hash]
            if (card){
                this.$store.commit('goDeeper', hash)
                this.task.name = ''
            } 
        },
        pileRecalled() {
          if (!this.$store.state.upgrades.create){
              return this.$store.commit('toggleCreate')
          }
          if (this.matchIds.length > 0){
              this.$store.dispatch("makeEvent", {
                  type: "pile-sub-tasked",
                  inId: this.$store.getters.contextCard.taskId,
                  tasks: this.matchIds
              })
          }
        },
        toChest(){
            if (this.$store.state.upgrades.mode === "chest"){
                this.$store.commit("setMode", 0)
            } else {
                this.$store.commit("setMode", 3)
            }
        },
        toTimeCube(){
            if (this.$store.state.upgrades.mode === "timecube"){
                this.$store.commit("setMode", 0)
            } else {
                this.$store.commit("setMode", 2)
            }
        },
        toBoat(){
            if (this.$store.state.upgrades.mode === "boat"){
                this.$store.commit("setMode", 0)
            } else {
                this.$store.commit("setMode", 1)
            }
        },
        matchCards() {
            searchDebounce = setTimeout(() => {
            this.showSearch = false
            let cards = []
            let guilds = []
            let doges = []
            let search = this.task.name.trim()
            let dontsearch = this.$store.state.upgrades.search === search
            if (this.$store.state.upgrades.search.length > 0 && !dontsearch && this.matches.cards.length + this.matches.guilds.length + this.matches.doges.length === 0){
                let alreadySearched = new RegExp(this.$store.state.upgrades.search, 'i')
                dontsearch = alreadySearched.test(search)
            }
            if (dontsearch){
                return this.matchCards
            }
            if(search.length < 3) {
                this.showSearch = false
                return { guilds, doges, cards}
            }
              this.showSearch = true
              process.nextTick(() => {
                  try {
                    let regex = new RegExp(search, 'i')
                    this.$store.state.tasks.forEach(t => {
                      if (t.taskId === this.$store.getters.contextCard.taskId) return //
                      if(t.guild && regex.test(t.guild)) {
                        guilds.push(t)
                      } else if(regex.test(t.name)) {
                        cards.push(t)
                      }
                    })
                    this.$store.state.members.forEach(member => {
                      if(regex.test(member.name)) {
                        doges.push(member)
                      }
                    })
                  } catch (err){
                    return
                  }
                  this.$store.commit('setSearch', search)
                  this.matches = { guilds, doges, cards}
                  this.showSearch = false

              })
            }, 989)
        },
        lockIt(){
            if (!this.$store.state.upgrades.create){
                return this.$store.commit('toggleCreate')
            }

            let toHide = this.task.name.trim()
            if (toHide){
                let pubkey = this.$store.state.cash.publicKey
                let potentialCard = cryptoUtils.encryptToPublic(pubkey, toHide)
                this.$store.dispatch("makeEvent", {
                  type: 'task-locked',
                  name: potentialCard,
                  color: this.$store.state.upgrades.color,
                  deck: [this.$store.getters.member.memberId],
                  inId: this.taskId,
                })
                this.resetCard()
            }
        },
        boatAll(){
            this.$store.dispatch("makeEvent", {
                type: 'pile-prioritized',
                tasks: this.matchIds,
                inId: this.$store.getters.contextCard.taskId,
            })
        },
        deBoatAll(){
            this.$store.dispatch("makeEvent", {
                type: 'pile-de-sub-tasked',
                tasks: this.matchIds,
                inId: this.$store.getters.contextCard.taskId,
            })
        },
        switchColor(color){
            if (this.$store.state.upgrades.color === color){
                this.$store.commit('toggleCreate')
            } else {
                this.$store.commit('toggleCreate')
            }
            this.$store.commit('setColor', color)
        },
        refocus(keyp){
            document.getElementById('card').focus()
            this.task.name += keyp
        },
        resetMaybe(x){
            if (x.key === 'Escape') { 
                this.resetCard();
                this.$store.commit('createOff');
            } 
        },
        resetCard(){
            this.task.name = ''
            this.$store.commit('focus', '')
            this.encryptIt = false
            document.getElementById("btnpanel").blur()
        },
        subTaskTask(taskId) {
            this.$store.dispatch("makeEvent", {
                type: 'task-sub-tasked',
                inId: this.taskId,
                taskId,
                memberId: this.$store.getters.member.memberId,
            })
        },
        createOrFindTask(){
            if (!this.$store.state.upgrades.create){
                document.getElementById('card').focus()
                return this.$store.commit('toggleCreate')
            }

            if (this.encryptIt){
                return this.lockIt()
            }

            let potentialCard = this.task.name.trim()
            if (potentialCard.length === 0){
                return
            }
            let foundId = false
            let potentialCardHash = cryptoUtils.createCardHash(potentialCard)
            this.$store.state.tasks.some(t => {
                if (t.taskId === potentialCardHash){
                    foundId = t.taskId
                    return true
                }
            })
            if(!foundId) {
                this.$store.dispatch("makeEvent", {
                    type: 'task-created',
                    name: potentialCard,
                    color: this.$store.state.upgrades.color,
                    deck: [this.$store.getters.member.memberId],
                    inId: this.taskId,
                })
                this.nextColor()
            } else {
                this.subTaskTask(foundId)
            }
            this.resetCard()
            if (this.showCreate){
                this.$store.commit('toggleCreate')
            }
        },
        isGrabbed(taskId){
            return this.$store.state.tasks[this.$store.state.hashMap[taskId]].deck.indexOf( this.$store.getters.member.memberId ) > -1
        },
        nextColor() {
            let colors = ['red', 'yellow', 'green', 'purple', 'blue']
            let color = colors.indexOf(this.$store.state.upgrades.color)
            color++
            this.switchColor(colors[color > 4 ? 0 : color], false)
        },
        previousColor() {
            let colors = ['red', 'yellow', 'green', 'purple', 'blue']
            let color = colors.indexOf(this.$store.state.upgrades.color)
            color--
            this.switchColor(colors[color < 0 ? 4 : color], false)
        },
        resultInputSty(card) {
          return {
              redwx : card.color == 'red',
              bluewx : card.color == 'blue',
              greenwx : card.color == 'green',
              yellowwx : card.color == 'yellow',
              purplewx : card.color == 'purple',
              blackwx : card.color == 'black',
          }
        },
        loadResult() {
            this.matchCards()
            this.$store.commit('setSearch', this.task.name.trim())
        },
        shortName(theName) {
            let shortname = calculations.shortName(theName)
            let splitty = shortname.split(this.$store.state.upgrades.search.toLowerCase())
            return splitty
        },
    },
    computed: {
        nameWatcher(){
            clearTimeout(searchDebounce)
            this.matchCards()
            return this.task.name
        },
        refocusWatcher(){
            let keyp = this.$store.state.upgrades.keypressed.toString()

            if (!this.showCreate && keyp){
                this.$store.commit('toggleCreate')
            }
            if (keyp && focusBouncer !== this.$store.state.upgrades.refocus){
                if (keyp === 'Backspace') keyp = ''
                if (keyp === 'Enter'){
                    return this.createOrFindTask()
                } else {
                  this.refocus(keyp)
                }
            }
            focusBouncer = this.$store.state.upgrades.refocus
            return this.$store.state.upgrades.refocus
        },
        showCreate(){
            return this.$store.state.upgrades.create
        },
        searchEqual(){
            return this.search == this.task.name
        },
        searchTotal(){
            return this.matches.guilds.length + this.matches.doges.length + this.matches.cards.length
        },
        taskId(){
            return this.$store.getters.contextCard.taskId
        },
        matchIds(){
            return this.matches.guilds
                .concat(this.matches.doges)
                .concat(this.matches.cards)
                .map(t => {
                  if (t.taskId) return t.taskId
                  if (t.memberId) return t.memberId
                })
        },
        cardInputSty() {
            if (this.$store.getters.member.stacks === 5){
                return {
                    redwx : this.$store.state.upgrades.color == 'red',
                    bluewx : this.$store.state.upgrades.color == 'blue',
                    greenwx : this.$store.state.upgrades.color == 'green',
                    yellowwx : this.$store.state.upgrades.color == 'yellow',
                    purplewx : this.$store.state.upgrades.color == 'purple',
                    blackwx : this.$store.state.upgrades.color == 'black',
                    inactive: this.task.name == ''
                }
            }
            return {
                nowx: true,
                inactive: this.task.name == ''
            }
        },
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours';
@import '../styles/button';
@import '../styles/breakpoints';
@import '../styles/input';
@import '../styles/switch';
@import '../styles/spinners';

.spin
    height: 1.4em

textarea
    border-color: rgba(0, 0, 0, 0.4)
    height: 7em
    max-height: 11vh
    min-height: 2em;
textarea.inactive
    height: 2em
    padding-bottom: 2.5em

.boatContainer button
    color: white
.lonestar
    height: 2em
    background-color : lightGrey
    width: 20em
    position: fixed
    left: 50%
    transform: translateX(-50%)
.searchtotal
    cursor: pointer
    border-bottom-style: solid
    border-color: main
    margin-bottom: 0.23456em


.boatContainer button.create
    color: main

#createtask
  width: 69%
  margin: 0 auto 0 auto
  text-align: center
  padding: 0.05em
  position: fixed
  z-index: 1649
  bottom: -1em
  left: 50%
  transform: translateX(-50%)
  font-size: 1.67em

.lit
    opacity: 0.69

.opaque > button.lit
    opacity: 1

.onetime
    display: inline

.color
    height: 2.5em
    padding: 1em

.colorlabel
    align-content: center;
    text-align: center

@media (max-width: breakpoint)
    .colorlabel
        span
            display: none

#bark
    float: right
    height: 3em

.fwi
    text-align: center

.tealbk
    background: green

.cc
    position: relative

.upgradeimg
   height: 3em

.btnpanel
    overflow: hidden
    button
        cursor: pointer
        min-height: 2.5em
        width: 4.045085em
        margin: 0
        padding-bottom: 2.5em

.btnwrapper
    width: 100%
    display: block
    text-align: center

.slide-fade-enter-active {
  transition: all .6s ease;
}
.slide-fade-leave-active {
  transition: all .4s ease;
}
.slide-fade-enter {
  // transform: translateY(-400px);
  opacity: 0;
}
.slide-fade-leave-to {
 // transform: translateY(-400px);
  opacity: 0;
}

.label
    font-weight: bolder

.centr
    text-align: center

.paperwrapper
    position: relative

.agedbackground
    background-image: url('/paper.jpg')
    background-repeat: no-repeat
    background-position: center center
    background-size: cover
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: absolute
    width: 100%
    height: 100%
    opacity: 0.2

.down
    color: lightGrey

.down:before
    color: lightGrey

.loadin
    color: softerGrey

.loadin:before
    color: softerGrey

.currentColor
    opacity: 1

.closeit
    position: fixed
    width: 100%
    height: 90%
    background-color: rgba(22, 22, 22, 1)
    z-index: 148
    top: 0
    left: 0
    margin: 0
    padding: 0

.scrollbarwrapper
    width: 100%
    height: calc(100% - 2em)
    position: absolute
    top: calc(-100% - 0.5em)
    left: 0
    background: lightGrey
    padding: 1em 0
    border-radius: 20px
    cursor: default

@media only screen and (max-width: 68em)
    .scrollbarwrapper
        width: 100%

.searchresults
    overflow: auto
    font-size: 1.1em
    height: 100%
    padding: 0 1em
    word-wrap: break-word

::-webkit-scrollbar
    background-color: rgba(22, 22, 22, 0.4)

::-webkit-scrollbar-thumb
    background-color: rgba(89, 89, 89, 0.4)

.result
    margin-left: 4em
    margin-right: 4em
    margin-bottom: 0.3em
    cursor: crosshair

.smallguild
    height: 1em
    margin-right: 0.3em
    position: relative
    top: 0.16em

.guildname
    font-weight: bold

.current.result
    display: block

.uni
    position: fixed
    bottom: 0

    left: 50%
    transform: translateX(-50%)
    height: 5.5555555555em
    cursor: pointer
    z-index: 9002

.boatContainer
    display: flex;
    justify-content: space-between;
    width:100%
    height:45px

.boatAll
    margin: 0 1em 0 1em
    height: 11em;
    width: 2em
    background: main
    position: relative
    margin-top: 1em
    margin-bottom: 1em
    cursor: pointer

.boatR
    position: absolute
    right: 0px

.faded
    opacity: 0.235654

.secondbackground
    cursor: pointer

.boatContainer button.selected
    background: main
    color: softGrey

.boatContainer button:hover
    opacity: 0.9

.ping
    padding-top: 0.789em
    position: absolute
    left: 3px
    bottom: 3px

.pend
    float: right

.fifth
    display: inline-block
    width: 20%
    font-size: 4.44em
    color: main
    margin-top:-0.44em
    border-radius: 2%
.fifth:before
    content: "\2022";

.fifth:hover
    opacity: 0.9

.ping
    position: absolute
    bottom: 0
    left: 0

.bottomleft
    -webkit-text-stroke-width: 1px;
    -webkit-text-stroke-color: main;
    display: inline-block
    width: 33.3%
    cursor: pointer
    color: lightGrey
    text-align: center
    img
        height: 1.11em
.bottomleft:hover
    opacity: 0.7

.bottomleft.activationsequence
    img
        height: 1.77em

.hidden
    opacity: 0

.gem
    cursor: pointer;
    width: -webkit-min-content;
    width: 100%;
    height: 2.789em;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 0;
    border-radius: 50% 50% 0 0;
    top: -2.789em;
    padding-top: 0.2em;
    padding-bottom: 0.2em;
    img
        height: 2em

button.lock img
    float: left
    height: 1.4505em
    margin-left: 2em


</style>
