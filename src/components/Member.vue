<template lang='pug'>

.memberrow.membershipcard(:ondrop="drop"   :ondragover="allowDrop" )
    .bottomright()
        div(@click='$store.commit("setMode", 3)'  :class='{here: $store.state.upgrades.mode === "chest"}')
            .stash(v-if='card.boost > 0') {{ card.boost.toLocaleString() }}
            .stash(v-else) - -
    .topleft(v-if='$store.getters.inbox.length > 1'  @click='goDoge')
        img.smallguild(src='../assets/images/sendselected.svg')
        label.stash {{ $store.getters.inbox.length }}
    .row.center.clearboth(@click='$store.commit("setMode", 0)'   :class='{ pullup : $store.state.upgrades.mode !== "doge" && dukkha >= 1 }')
        label(:class='{ spacer: $store.state.upgrades.mode !== "doge" || $store.getters.contextCard.priorities.length < 1 }')
            div(v-if='$store.getters.contextMember')
                img.doge(src='../assets/images/doge.svg')
                linky(:x='m.name')
            card(v-else  :b='card')
    div
        .bottomleft(@click='toBoat'  :class='{activationsequence: $store.state.upgrades.mode === "boat"}')
            img(src='../assets/images/completed.svg')
        .bottomleft(@click='toTimeCube'  :class='{activationsequence: $store.state.upgrades.mode === "timecube"}')
            img(src='../assets/images/timecube.svg')
        .bottomleft(@click='toChest'  :class='{activationsequence: $store.state.upgrades.mode === "chest"}')
            img(src='../assets/images/bitcoin.svg')
    .clearboth
</template>

<script>

import Current from './Current'
import Linky from './Linky'
import Auth from './Auth'
import Card from './Card'

export default {
    props: ['m'],
    components: {Current, Linky, Auth, Card},
    computed:{
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
        allowDrop(ev){
            ev.preventDefault()
        },
        drop(ev){
            ev.preventDefault();
            var data = ev.dataTransfer.getData("taskId")
            this.$store.dispatch("makeEvent", {
                type: 'task-prioritized',
                inId: this.$store.getters.contextCard.taskId,
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
    background-color: softGrey
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
    img
        height: 1.11em
.bottomleft:hover
    opacity: 0.7

.bottomleft.activationsequence
    img
        height: 1.77em

.bottomright
    width: fit-content
    right: 0.1em
    top: 0.1em
    float: right
    cursor: pointer

.stash
    display: inline
    margin-left: 0.5em
    position: relative
    top: -0.35em

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

.pullup
    margin-bottom: -2em
</style>
