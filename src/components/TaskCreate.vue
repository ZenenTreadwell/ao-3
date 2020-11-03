<template lang='pug'>
#createtask(ref="closeable")
  div.secondbackground(@click.stop='switchColor(task.color)')
      transition(name="slide-fade")
        .cc(v-show='showCreate')
            .boatContainer
                button.clear(@click='resetCard') clear
                button.lock(@click='lockIt') lock
                button.create(@click='createOrFindTask') create
            textarea(@click.stop)#card.paperwrapper(
                v-model='debouncedName'
                type='text'
                :class='cardInputSty'
                placeholder="textarea"
                @keyup.enter.exact='createOrFindTask'
                @keydown.enter.exact.prevent
                @keyup.esc='closeCreate'
                @input='exploring = false'
                row='10'
                col='20'
            )
      #btnpanel.btnpanel
          div(:class='{ opaque : showCreate, btnwrapper : !showCreate }')
              div(v-if='$store.getters.member.stacks === 5')
                  button(@click.stop='switchColor("red")'  :class='{ down : task.color === "red" }').redwx.paperwrapper
                  button(@click.stop='switchColor("yellow")'  :class='{ down : task.color === "yellow" }').yellowwx.paperwrapper
                  button(@click.stop='switchColor("green")'  :class='{ down : task.color === "green" }').greenwx.paperwrapper
                  button(@click.stop='switchColor("purple")'  :class='{ down : task.color === "purple" }').purplewx.paperwrapper
                  button(@click.stop='switchColor("blue")'  :class='{ down : task.color === "blue" }').bluewx.paperwrapper
              div(v-else)
                  .lonestar.lit(@click.stop='switchColor("blue")'  :class='{ down : showCreate }').paperwrapper
      .scrollbarwrapper(v-show='showCreate && searchTotal > 0')
          .searchresults
              .boatContainer
                  img.boatAll.faded(src='../assets/images/downboat.svg'  @click='deBoatAll')
                  .searchtotal(@click='goInSearchPanel') {{ searchTotal }}
                  img.boatAll.boatR.faded(src='../assets/images/upboat.svg'  @click='boatAll')
              .result(v-for='t in $store.getters.matchCards.guilds'  @click.stop='debounce(loadResult, 500, [t])'  :class='resultInputSty(t)'  @dblclick.stop='goIn(t.taskId)')
                  img.smallguild(src='../assets/images/badge.svg')
                  span {{ t.guild }}
                  div {{ shortName(t.name) }}
              .result(v-for='t in $store.getters.matchCards.doges'  @click.stop='debounce(loadResult, 500, [t])'  :class='resultInputSty(t)'  @dblclick.stop='goIn(t.taskId)')
                  current(:memberId='t.memberId')
              .result(v-for='t in $store.getters.matchCards.cards'  @click.stop='debounce(loadResult, 500, [t])'  :class='resultInputSty(t)'  @dblclick.stop='goIn(t.taskId)') {{ shortName(t.name) }}
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
                search: '',
                color: 'green',
            },
            swipeTimeout: 0,
            searchResults: [],
            exploring: true,
            inDebounce: false,
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

        mc.on('press', () => {
            navigator.clipboard.readText().then(clippy => {
                console.log('press', clippy)
                this.openCreate()
                if (clippy){
                  this.task.name += clippy
                }
            })
        })

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
        lockIt(){
            let toHide = this.task.name.trim()
            let pubkey = this.$store.state.cash.publicKey
            let potentialCard = cryptoUtils.encryptToPublic(pubkey, toHide)
            this.$store.dispatch("makeEvent", {
                type: 'task-created',
                name: potentialCard,
                color: this.task.color,
                deck: [this.$store.getters.member.memberId],
                inId: this.taskId,
            })
            this.resetCard()
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
        },
        deBoatAll(){
            this.$store.dispatch("makeEvent", {
                type: 'pile-de-sub-tasked',
                tasks: this.matchIds,
                inId: this.$store.getters.contextCard.taskId,
            })
        },
        toCardMode(){
            this.$store.commit("setDimension", 0)
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
            } else if (this.showCreate) {
                // don't close, switch
            } else {
                this.showCreate = !this.showCreate
            }
            this.task.color = color
            if(refocus) {
                setTimeout(()=>{
                    document.getElementById('card').focus()
                }, 1)
            }
        },
        resetCard(){
            this.task.name = ''
            this.$store.commit('setSearch', '')
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
            let foundId = this.matchCard
            let potentialCard = this.task.name.trim()
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
        },
        closeCreate() {
            this.showCreate = false
        },
        resultInputSty(card) {
          return {
              redtx : card.color == 'red',
              bluetx : card.color == 'blue',
              greentx : card.color == 'green',
              yellowtx : card.color == 'yellow',
              purpletx : card.color == 'purple',
              blacktx : card.color == 'black',
          }
        },
        loadResult(t) {
            this.task.name = t.name.trim()
            this.task.color = t.color
            this.$store.commit('setSearch', this.task.name)
        },
        debounce(func, delay) {
            clearTimeout(this.inDebounce)
            this.inDebounce = setTimeout(() => func.apply(this, arguments[2]), delay) // confusing
        },
        shortName(theName) {
            return calculations.shortName(theName)
        },
    },
    computed: {
        searchTotal(){
            return this.$store.getters.matchCards.guilds.length + this.$store.getters.matchCards.doges.length + this.$store.getters.matchCards.cards.length
        },
        isCard(){
            return this.$store.state.upgrades.dimension === 'unicorn'
        },
        taskId(){
            return this.$store.getters.contextCard.taskId
        },
        matchCard(){
            let foundId
            this.$store.state.tasks.filter(t => {
                let trimmy = this.task.name.trim()
                if(t.name === trimmy || t.guild === trimmy) {
                    foundId = t.taskId
                }
            })
            return foundId
        },
        matchIds(){
            return this.$store.getters.matchCards.guilds
                .concat(this.$store.getters.matchCards.doges)
                .concat(this.$store.getters.matchCards.cards)
                .map(t => t.taskId)
        },
        cardInputSty() {
            if (this.$store.getters.member.stacks === 5){
                return calculations.cardColorCSS(this.task.color)
            }
            return {nowx: true}
        },
        debouncedName: {
            get() {
                return this.task.name
            },
            set(newValue) {
                this.task.name = newValue
                this.debounce(() => {
                    this.$store.commit('setSearch', newValue)
                }, 400)
            }
        },
    }
}

</script>

<style lang='stylus' scoped>

textarea
    background-color: darkGrey


@import '../styles/colours';
@import '../styles/button';
@import '../styles/breakpoints';
@import '../styles/input';
@import '../styles/tooltips';

.boatContainer button
    background-color: main
.boatContainer button:hover
    background-color: lightGrey
    color: main

.lonestar
    height: 2em
    background-color : lightGrey
    width: 20em
    position: fixed
    left: 50%
    transform: translateX(-50%)
.searchtotal
    position: absolute
    top: 0
    right: calc(50%-1em)
    cursor: pointer

#createtask
  width: 81%
  background-color: rgba(51, 51, 51, 0.3)
  margin: 0 auto 0 auto
  text-align: center
  padding: 0.5em
  position: fixed
  z-index: 149
  bottom: 0
  left: 50%
  transform: translateX(-50%)

.lit
    opacity: 0.69

.btnwrapper:hover > .lit
    opacity: 0.83

.btnwrapper:hover > .lit:hover
    opacity: 1

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

textarea
    border-color: rgba(0, 0, 0, 0.4)
    height: 12.5em

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
    background-image: url('../assets/images/down.svg')
    background-size: cover
    background-position: center center
    opacity: 0.9

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
    width: 37vw
    height: calc(100% - 2em)
    position: absolute
    top: calc(-100% - 0.5em)
    left: 0
    background: rgba(22, 22, 22, 0.8)
    padding: 1em 0
    border-radius: 20px

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

::-webkit-scrollbar-thumb:hover
    background-color: rgba(255, 255, 255, 0.75)

.result
    margin-bottom: 0.3em
    cursor: pointer

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
    height: 20px;
    position: relative
    margin-top: 1em
    margin-bottom: 1em
    z-index:9999999999999
    cursor: pointer

.boatR
    position: absolute
    right: 0px
    height:20px

.faded
    opacity: 0.235654

.secondbackground
    background: main
    cursor: pointer

</style>
