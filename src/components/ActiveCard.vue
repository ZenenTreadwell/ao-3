<template lang='pug'>

.activecard(:class='styl' :ondrop="drop"   :ondragover="allowDrop"  :ondragleave='dragLeave')
    .flextabs
        .tabber(@click='toBoat'  :class='{activationsequence: $store.state.upgrades.mode === "boat"}'   :ondragover='toBoatOnly')
            img(src='../assets/images/completed.svg')
        .tabber(@click='toTimeCube'  :class='{activationsequence: $store.state.upgrades.mode === "timecube"}'  :ondragover='toTimeCubeOnly')
            img(src='../assets/images/timecube.svg')
        .tabber(@click='toChest'   :class='{activationsequence: $store.state.upgrades.mode === "chest"}')
            span &#9889;
    .row.center.clearboth(@click='copyCard'  draggable="true"  :ondragstart='dragStart' )
        label
            .itsamember(v-if='$store.getters.contextMember')
                img(src='../assets/images/doge.svg')
                linky.doge(:x='m.name')
            div(v-else-if='$store.getters.contextResource')
                currentr(:resourceId='$store.getters.contextCard.taskId')
            div(v-else)
                linky.doge(:x='card.name')
                img(v-show='copied'  src='../assets/images/clipboard.svg')
            span.timetill(v-if='cardStart.timeSet')
                span(v-if='cardStart.days > 1'  @click='clearSchedule') in {{ cardStart.days.toFixed(1) }} days
                span(v-else-if='cardStart.hours > 1'  @click='clearSchedule') in {{ cardStart.hours.toFixed(1) }} hours
                span(v-else-if='cardStart.minutes > 1'  @click='clearSchedule') in {{ cardStart.minutes.toFixed(1) }} minutes
    .clearboth
    .centererer(v-if='$store.state.upgrades.mode === "chest"') {{$store.getters.contextCard.boost.toLocaleString()}}
</template>

<script>

import Current from './Current'
import Coin from './Coin'
import Currentr from './Currentr'
import Linky from './Linky'
import Auth from './Auth'
import Card from './Card'
import Pinner from './Pinner'
import ResourceBook from './ResourceBook'

let debounce = false

export default {
    data(){
        return {
            copied: false,
            dropping: false
        }
    },
    components: {Current, Linky, Auth, Card, Coin, Pinner, ResourceBook, Currentr},
    computed:{
        cardStart(){
            let days = 0
            let hours = 0
            let minutes = 0
            let cstar = {
                timeSet: false,
                days,
                hours,
                minutes
            }
            let msTill = this.$store.getters.contextCard.book.startTs - Date.now()
            if ( this.$store.getters.contextCard.book.startTs && msTill > 0){
              cstar.timeSet = true
              cstar.days = msTill / (1000 * 60 * 60 * 24)
              if (cstar.days > 1){
                  return cstar
              }
              cstar.hours = cstar.days * 24
              if (cstar.hours > 1){
                  return cstar
              }
              cstar.minutes = cstar.hours * 60
              return cstar
            }
            return cstar
        },
    
        styl(){
            let color = this.$store.getters.contextCard.color
            if (!color  || this.$store.getters.member.stacks === 1) return
            return {
                dropping: this.dropping,
                bluewx : color == 'blue',
                redwx : color == 'red',
                greenwx : color == 'green',
                yellowwx : color == 'yellow',
                purplewx : color == 'purple',
                blackwx : color == 'black',
            }
        },
        m(){
            return this.$store.getters.contextMember
        },
        card(){
            return this.$store.getters.contextCard
        },
        isGrabbed(){
          return this.card.deck.indexOf(this.$store.getters.member.memberId) >= 0
        },
        isLoggedIn(){
            let isLoggedIn
            this.$store.state.sessions.forEach( s => {
                if ( s.ownerId === this.m.memberId ){
                    isLoggedIn = true
                }
            })
            return isLoggedIn
        },
        nameList(){
            return this.$store.getters.contextCard.deck.map(mId => {
                return mId
            })
        },
        dukkha() {
            return this.$store.getters.contextCard.priorities.length
        },
        deckSize() {
            return this.$store.state.tasks.filter(t => {
                return t.deck.indexOf(this.m.memberId) >= 0
            }).length
        },
    },
    methods: {
        clearSchedule(){
            this.$store.dispatch('makeEvent', {
                type: 'resource-booked',
                resourceId: this.$store.getters.contextCard.taskId,
                memberId: this.$store.getters.member.memberId,
                startTs: 0,
                endTs: 0,
            })
        },
        goDeeper(taskId){
            this.$store.commit("closeAll")
            this.$store.commit("goDeeper", taskId)
        },
        copyCard(){
            navigator.clipboard.writeText(this.$store.getters.contextCard.name).then(()=>{
                this.copied = true
            })
            this.goDoge()
            setTimeout(()=> this.copied = false, 1234)
        },
        dragLeave(){
            this.dropping = false
        },
        dragStart(ev){
            ev.dataTransfer.setData("taskId", this.$store.getters.contextCard.taskId);
        },
        allowDrop(ev){
            ev.preventDefault()
            this.dropping = true
        },
        drop(ev){
            ev.preventDefault();
            this.dropping = false
            var data = ev.dataTransfer.getData("taskId")
            this.$store.dispatch("makeEvent", {
                type: 'task-prioritized',
                inId: this.$store.getters.contextCard.taskId,
                fromId: this.$store.getters.contextCard.taskId,
                taskId: data,
            })
            this.$store.commit("setMode", 1)
        },
        toChest(){
            if (this.$store.state.upgrades.mode === "chest"){
                this.$store.commit("setMode", 0)
            } else {
                this.$store.commit("setMode", 3)
            }
        },
        toTimeCubeOnly(){
            this.$store.commit("setMode", 2)
        },
        toTimeCube(){
            if (debounce){
                return
            }
            debounce = true
            if (this.$store.state.upgrades.mode === "timecube"){
                this.$store.commit("setMode", 0)
            } else {
                this.$store.commit("setMode", 2)
            }
            setTimeout(()=> debounce = false, 333)
        },
        toBoatOnly(){
            this.$store.commit("setMode", 1)
        },
        toBoat(){
            if (debounce){
                return
            }
            debounce = true
            if (this.$store.state.upgrades.mode === "boat"){
                this.$store.commit("setMode", 0)
            } else {
                this.$store.commit("setMode", 1)
            }
            setTimeout(()=> debounce = false, 333)
        },
        goDoge(){
            this.$store.commit('setMode', 0)
        },
        goBadge(){
            if(this.$store.state.upgrades.mode === 'badge') {
                if (this.isGrabbed){
                    this.$store.dispatch("makeEvent", {
                      type: 'task-dropped',
                      taskId: this.card.taskId,
                      memberId: this.$store.getters.member.memberId,
                    })
                } else {
                    this.$store.dispatch("makeEvent", {
                      type: 'task-grabbed',
                      taskId: this.card.taskId,
                      memberId: this.$store.getters.member.memberId,
                    })
                }
            }
        },
        getName(taskId){
            let name
            this.$store.state.tasks.some(t => {
                if (taskId === t.taskId){
                    name = t.name
                    return true
                }
            })
            return name
        },
        toggleActivated() {
            if(this.m.memberId !== this.$store.getters.member.memberId) {
                return
            }
            if(this.$store.getters.member.active > 0) {
                this.deactivate()
            } else {
                this.activate()
            }
        },
        deactivate() {
            this.$store.dispatch("makeEvent", {
                type: 'member-deactivated',
                memberId: this.$store.getters.member.memberId,
            })
        },
        activate() {
            this.$store.dispatch("makeEvent", {
                type: 'member-activated',
                memberId: this.$store.getters.member.memberId,
            })
        }

    }
}
</script>

<style lang="stylus" scoped>

@import '../styles/colours'

.timetill
    cursor: pointer;

.timetill span:hover
    text-decoration: line-through;

.doge
    color: main
    height: 1.111em
    display: inline-block
    padding: .3em;
    border-radius: 50%;
    margin-right: 0.4em;

.tabber img.roro
    transform: rotate(45deg);
    height: 0.333333em
    float: left;

label img
    height: 1.389em
    display: inline

label div
    cursor: pointer

.row.center.clearboth
    cursor: pointer

.here
    border-bottom-style: solid;
    padding: .2em;
    border-color:#eeeeeeac;

.fw
    width: 100%

img
    height: 2em

label
    font-weight: normal;
    margin: 1em
    display: block

.spacer
    margin-bottom: 3em

.activecard
    margin-left: 1em
    margin-right: 1em
    margin-top: 0.35em
    // padding: 1em
    //-- background-color: rgba(255,255,255,.833)
    margin-bottom: 1em
    padding-bottom: 1em
    // padding-top: 1em
    box-shadow:
         2px 2px 6px 3px main , 
         2px 2px 7px 4px softGrey, 
         2px 2px 8px 5px lightGrey;

.smallguild
    height: 2em

.topleft
    float: left
    width: fit-content
    position: relative
    bottom: 0
    left: 0
    cursor: pointer

.flextabs
    display: flex
    flex-direction:row
    justify-content: flex-start
    cursor: pointer

.centererer
    text-align: center
    color: lightGrey

.tabber
    cursor: pointer
    flex-shrink: 1
    color: lightGrey
    background-color: transparent;
    text-align: center
    min-width: 2.22em;
    max-width: 3.3em;
    border-bottom-left-radius: 40%;
    border-bottom-right-radius: 40%;
    border-bottom-width: 3px;
    border-color: main;
    border-bottom-style: solid
    border-left-style: solid
    border-right-style: solid
    margin-left: .77em
    img
        height: 1.11em
        padding-top: 0.22em
        padding-left: 0.37em
        padding-right: 0.37em
.tabber:hover
    opacity: 0.88
    background-color: lightGrey;


.tabber.activationsequence
    background-color: softGrey;
    -webkit-box-sizing: content-box;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
    -o-text-overflow: ellipsis;
    text-overflow: ellipsis;
    // box-shadow: 0 3px 10px rgb(0 0 0 / 0.2)
    opacity: 1

.tabber.activationsequence:hover
    background-color: lightGrey;

.stash
    display: inline
    left: -0.212em
    position: relative
    top: 0

.clearboth
    clear: both

.title
    cursor: pointer
    font-size: 1.8em
    margin-top: 0.5em
    font-weight: bold

.help
    font-size: 1.3em

.suggest
    font-style: italic
    font-size: 1.3em

.faded
    opacity: 0.39

.membertooltip
    font-size: 0.7em

ul.left
    text-align: left

.clearboth
    clear: both

.stash:hover span
    text-decoration: line-through;

.stash span
    cursor: pointer;

.activecard
    background: lightGrey
.activecard.dropping
    background: blue

.itsamember
    height: 3em;

</style>
