<template lang='pug'>

.memberrow.membershipcard(:class='{dropping}'  :ondrop="drop"   :ondragover="allowDrop"  :ondragleave='dragLeave')
    .bottomright()
        div(:class='{here: $store.state.upgrades.mode === "chest"}')
            img.boosted(src='../assets/images/hourglass.svg'  v-if='$store.state.upgrades.mode === "doge" && m.action'  @click.stop='goDeeper(m.action)')
            //- .stash(v-if='$store.state.upgrades.mode === "chest"') {{ card.boost.toLocaleString() }}
            .stash
                checkbox(:b='$store.getters.contextCard'  :inId='$store.getters.contextCard.taskId')
            //-
    .row.center.clearboth(@click='copyCard'  draggable="true"  :ondragstart='dragStart' )
        label
            div(v-if='$store.getters.contextMember')
                img.doge(src='../assets/images/doge.svg')
                linky(:x='m.name')
            div(v-else-if='$store.getters.contextResource')
                currentr(:resourceId='$store.getters.contextCard.taskId')
            div(v-else)
                pinner(:b='$store.getters.contextCard', :inId='$store.getters.contextCard.taskId')
                linky(:x='card.name')
                img(v-show='copied'  src='../assets/images/clipboard.svg')
    div
        .bottomleft(@click='toBoat'  :class='{activationsequence: $store.state.upgrades.mode === "boat"}'   :ondragover='toBoat')
            img.roro(v-if='$store.state.upgrades.mode !== "boat"  && card.priorities.length > 0'  v-for='t in card.priorities'  src='../assets/images/uncompleted.svg'  :class='styl($store.state.tasks[$store.state.hashMap[t]].color)')
            img(src='../assets/images/completed.svg')
        .bottomleft(@click='toTimeCube'  :class='{activationsequence: $store.state.upgrades.mode === "timecube"}'  :ondragover='toTimeCube')
            img(src='../assets/images/timecube.svg')
        .bottomleft(@click='toChest'  :class='{activationsequence: $store.state.upgrades.mode === "chest"}')
            img(src='../assets/images/bitcoin.svg')
    .clearboth
</template>

<script>

import Current from './Current'
import Coin from './Coin'
import Currentr from './Currentr'
import Linky from './Linky'
import Auth from './Auth'
import Checkbox from './Checkbox'
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
    components: {Current, Linky, Auth, Card, Coin, Checkbox, Pinner, ResourceBook, Currentr},
    computed:{
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
        styl(color){
            if (!color  || this.$store.getters.member.stacks === 1) return
            return {
                redwx : color == 'red',
                bluewx : color == 'blue',
                greenwx : color == 'green',
                yellowwx : color == 'yellow',
                purplewx : color == 'purple',
                blackwx : color == 'black',
            }
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

.doge
    height: 1.0789em
    display: inline-block
    background-color: main
    padding: .3em;
    border-radius: 50%;
    margin-right: 0.4em;

.bottomleft img.roro
    transform: rotate(45deg);
    height: 0.333333em
    float: left;

label img
    height: 1.389em
    display: inline

label div
    cursor: pointer

.doge
    height: 1.111em

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

.membershipcard
    // padding: 1em
    background-color: rgba(255,255,255,.888)
    margin-bottom: 1em
    padding-bottom: 1em
    padding-top: 1em
    // box-shadow:
    //     0 0 6px 3px white,  /* inner white */
    //     0 0 7px 4px lightGrey, /* middle magenta */
    //     0 0 8px 5px main; /* outer cyan */

.smallguild
    height: 2em

.topleft
    float: left
    width: fit-content
    position: relative
    bottom: 0
    left: 0
    cursor: pointer

.topright
    float: right
    width: fit-content
    position: relative
    bottom: 0
    right: -1em
    cursor: pointer


.bottomleft
    -webkit-text-stroke-width: 1px;
    -webkit-text-stroke-color: main;
    display: inline-block
    width: 33.3%
    cursor: pointer
    color: lightGrey
    text-align: center
    opacity: 0.3
    img
        height: 1.11em
.bottomleft:hover
    opacity: 0.88

.bottomleft.activationsequence
    -webkit-box-sizing: content-box;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
    border: none;
    -o-text-overflow: ellipsis;
    text-overflow: ellipsis;
    // box-shadow: 0 3px 10px rgb(0 0 0 / 0.2)
    opacity: 1
.bottomright
    width: fit-content
    right: 0.1em
    top: 0.1em
    float: right

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

.dogecoin
    width: 3em
    height: 3em
    cursor: pointer

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

.memberrow.membershipcard.dropping
    background: blue

</style>
