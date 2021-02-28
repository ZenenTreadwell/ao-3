<template lang='pug'>


#createtask(ref="closeable" @keydown='testAll' @keyup.tab='testTab'  @keyup.esc='testEscape')
  div.secondbackground(@click='switchColor(task.color)')
      .boatContainer
          button.clear(@click.stop='toggleSearch'  :class='{selected: showSearch, inactive: task.name == ""}') search
          button.lock(@click.stop='lockIt'  :class='{inactive: task.name == ""}') encrypt
          button.create(@click.stop='createOrFindTask'  :class='{inactive: task.name == ""}') post
      .cc(v-show='showCreate')
          textarea#card.paperwrapper(
              v-model='task.name'
              type='text'
              :class='cardInputSty'
              placeholder="create card"
              @keyup.enter.exact='createOrFindTask'
              @keydown.enter.exact.prevent
              row='10'
              col='20'
              @click.stop
          )
      #btnpanel.btnpanel
          .ping {{ $store.state.loader.reqStatus }}
          div(:class='{ opaque : showCreate, btnwrapper : !showCreate }')
              .fifth(@click.stop='switchColor("red")'  :class='{ down : task.color === "red" && showCreate, loadin: $store.state.loader.pendingFlash[0] }').redtx.paperwrapper
              .fifth(@click.stop='switchColor("yellow")'  :class='{ down : task.color === "yellow" && showCreate, loadin: $store.state.loader.pendingFlash[1]}').yellowtx.paperwrapper
              .fifth(@click.stop='switchColor("green")'  :class='{ down : task.color === "green"  && showCreat, loadin: $store.state.loader.pendingFlash[2]}').greentx.paperwrapper
              .fifth(@click.stop='switchColor("purple")'  :class='{ down : task.color === "purple" && showCreate, loadin: $store.state.loader.pendingFlash[3]}').purpletx.paperwrapper
              .fifth(@click.stop='switchColor("blue")'  :class='{ down : task.color === "blue" && showCreate, loadin: $store.state.loader.pendingFlash[4]}').bluetx.paperwrapper
      .scrollbarwrapper(v-show='showSearch')
          .searchresults
              .searchtotal(@click='boatAll') {{ searchTotal }} of {{ $store.state.tasks.length }}
              .result(v-for='t in matches.guilds'  :class='resultInputSty(t)'  @click.stop='goIn(t.taskId)')
                  img.smallguild(src='../assets/images/badge.svg')
                  span {{ t.guild }}
              .result(v-for='t in matches.doges'  :class='resultInputSty(t)'  @click.stop='goIn(t.taskId)')
                  current(:memberId='t.memberId')
              .result(v-for='t in matches.cards'  @click.stop='goIn(t.taskId)')
                  span {{ shortName(t.name)[0] }}
                  span(:class='resultInputSty(t)') {{ $store.state.upgrades.search }}
                  span {{ shortName(t.name)[1] }}
</template>

<script>

import calculations from '../calculations'
import Hammer from 'hammerjs'
import cryptoUtils from '../crypto'

import Current from './Current'
export default {
    data(){
        return {
            showCreate: false,
            task: {
                name: '',
                color: 'blue',
            },
            search: '',
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
                this.closeCreate()
                this.swipeTimeout = Date.now()
            }
        });

        mc.on('swipeup', () => {
            if(Date.now() - this.swipeTimeout > 100) {
                this.openCreate()
                this.swipeTimeout = Date.now()
            }
        });
    },
    methods: {
        testAll(){
            if (this.showCreate === false){
                this.showCreate = true
                this.refocus()
            }
        },
        testEscape(){
            if (this.showCreate){
                this.showCreate = false
                this.showSearch = false
            }
        },
        testTab(){
            this.refocus()
            if (this.showCreate  && !this.searchEqual){
                return this.toggleSearch()
            }
            if (this.showSearch){
                return this.showSearch = false
            }
            switch (this.task.color){
                case "blue":
                    this.switchColor("green")
                    break
                case "green":
                    this.switchColor("purple")
                    break
                case "purple":
                    this.switchColor("yellow")
                    break
                case "yellow":
                    this.switchColor("red")
                    break
                case "red":
                    this.switchColor("blue")
                    break
            }
        },
        matchCards() {
            let cards = []
            let guilds = []
            let doges = []
            let search = this.task.name.trim()
            this.search = search
            if(search.length < 1) {
                console.log('search empty match avoided')
                return { guilds, doges, cards}
            }
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
                console.log("regex in error: ", err)
            }
            console.log('got', guilds.length, doges.length, cards.length, 'match')
            this.matches = { guilds, doges, cards}
        },
        toggleSearch(){
            if (!this.showCreate){
                return this.openCreate()
            }
            if (this.showSearch && this.search !== this.task.name.trim()){
                return this.loadResult()
            }
            if (!this.showSearch){
                this.loadResult()
            }
            this.showSearch = !this.showSearch
        },
        lockIt(){
            if (!this.showCreate){
                return this.openCreate()
            }
            let toHide = this.task.name.trim()
            if (toHide){
                let pubkey = this.$store.state.cash.publicKey
                let potentialCard = cryptoUtils.encryptToPublic(pubkey, toHide)
                this.$store.dispatch("makeEvent", {
                  type: 'task-locked',
                  name: potentialCard,
                  color: this.task.color,
                  deck: [this.$store.getters.member.memberId],
                  inId: this.taskId,
                })
                this.resetCard()
            }
        },
        goInSearchPanel(){
            this.$store.dispatch('goIn', {
                parents:[this.$store.getters.contextCard.taskId],
                panel:this.matchIds,
                top:0,
            })
        },
        boatAll(){
            this.$store.dispatch("makeEvent", {
                type: 'pile-prioritized',
                tasks: this.matchIds,
                inId: this.$store.getters.contextCard.taskId,
            })
            this.showCreate = false
            this.showSearch = false
        },
        deBoatAll(){
            this.$store.dispatch("makeEvent", {
                type: 'pile-de-sub-tasked',
                tasks: this.matchIds,
                inId: this.$store.getters.contextCard.taskId,
            })
        },
        goIn(taskId){
            clearTimeout(this.inDebounce)
            let panel = [taskId]
            let parents = []
            let top = 0

            if (this.$store.getters.contextCard.taskId){
                parents.push(this.$store.getters.contextCard.taskId)
            } else if (this.$store.getters.memberCard.taskId){
                parents.push(this.$store.getters.memberCard.taskId)
            }
            this.$store.dispatch("goIn", {
                parents,
                top,
                panel
            })
            if(this.$store.state.upgrades.mode === 'doge' && this.$store.getters.contextCard.priorities.length > 0) {
                this.$store.commit("setMode", 1)
            }
        },
        switchColor(color, refocus = true){
            if (this.task.color === color){
                this.showCreate = !this.showCreate
                this.showSearch = false
            } else if (this.showCreate) {
                // don't close, switch
            } else {
                this.showCreate = !this.showCreate
            }
            this.task.color = color
            if(refocus) {
                this.refocus()
            }
        },
        refocus(){
            setTimeout(()=>{
                document.getElementById('card').focus()
            }, 1)
        },
        resetCard(){
            this.task.name = ''
            this.showSearch = false
        },
        subTaskTask(taskId) {
            this.$store.dispatch("makeEvent", {
                type: 'task-sub-tasked',
                taskId: this.taskId,
                subTask: taskId,
                memberId: this.$store.getters.member.memberId,
            })
        },
        createOrFindTask(){
            if (!this.showCreate){
                return this.openCreate()
            }
            this.showSearch = false
            let potentialCard = this.task.name.trim()
            let foundId = false
            this.$store.state.tasks.some(t => {
                if (t.name === potentialCard){
                    foundId = t.taskId
                    return true
                }
            })
            this.resetCard()
            if(!foundId) {
                this.$store.dispatch("makeEvent", {
                    type: 'task-created',
                    name: potentialCard,
                    color: this.task.color,
                    deck: [this.$store.getters.member.memberId],
                    inId: this.taskId,
                })
            } else {
                this.subTaskTask(foundId)
            }
        },
        isGrabbed(taskId){
            return this.$store.state.tasks[this.$store.state.hashMap[taskId]].deck.indexOf( this.$store.getters.member.memberId ) > -1
        },
        nextColor() {
            let colors = ['red', 'yellow', 'green', 'purple', 'blue']
            let color = colors.indexOf(this.task.color)
            color++
            this.switchColor(colors[color > 4 ? 0 : color], false)
        },
        previousColor() {
            let colors = ['red', 'yellow', 'green', 'purple', 'blue']
            let color = colors.indexOf(this.task.color)
            color--
            this.switchColor(colors[color < 0 ? 4 : color], false)
        },
        openCreate() {
            this.showCreate = true
            this.refocus()
        },
        closeCreate() {
            this.showCreate = false
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
                .map(t => t.taskId)
        },
        cardInputSty() {
            if (this.$store.getters.member.stacks === 5){
                return {
                    redwx : this.task.color == 'red',
                    bluewx : this.task.color == 'blue',
                    greenwx : this.task.color == 'green',
                    yellowwx : this.task.color == 'yellow',
                    purplewx : this.task.color == 'purple',
                    blackwx : this.task.color == 'black',
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

textarea
    border-color: rgba(0, 0, 0, 0.4)
    height: 6em
textarea.inactive
    height: 2em

.boatContainer button
    background-color: main
    color: white

button.inactive
    opacity: 0.4321

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

#createtask
  width: 81%
  background-color: lightGrey
  margin: 0 auto 0 auto
  text-align: center
  padding: 0.05em
  position: fixed
  z-index: 149
  bottom: 2em
  left: 50%
  transform: translateX(-50%)
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: main;
  box-shadow:
      0 0 6px 3px white,
      0 0 7px 4px lightGrey,
      0 0 8px 5px main;
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
    color: main

.down:before
    color: main

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
    background-color: rgba(22, 22, 22, 0.2)
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
    background: lightGrey
    color: main

.boatContainer button:hover
    background: softerGrey

.ping
    padding-top: 0.789em
    position: absolute
    left: 3px
    bottom: 3px
    opacity: 0.77

.pend
    float: right

.fifth
    display: inline-block
    width: 20%
    font-size: 4.44em
    color: lightGrey
    margin-top:-0.4em
    margin-bottom:-0.4em
    border-radius: 2%
.fifth:before
    content: "\2022";

.fifth:hover
    background: softerGrey

</style>
