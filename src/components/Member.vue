<template lang='pug'>

.memberrow.membershipcard
    .topleft(v-if='$store.getters.inbox.length > 1'  @click='goDoge')
        img.smallguild(src='../assets/images/sendselected.svg')
        label.stash {{ $store.getters.inbox.length }}
    .row.center.clearboth(:class='{ pullup : $store.state.upgrades.mode !== "doge" && dukkha >= 1 }')
        label.hackername(:class='{ spacer: $store.state.upgrades.mode !== "doge" || $store.getters.contextCard.priorities.length < 1 }') {{ m.name }}
    .bottomleft(v-if='nameList.length > 0')
        div(@click='goBadge'  :class='{here: $store.state.upgrades.mode === "badge"}')
            div.adjtooltip.stash {{nameList.length}}
            .tooltiptext.v(v-if='$store.getters.member.tooltips')
                current(v-for='mId in nameList'  :memberId='mId').suggest
    .bottomright(v-if='card.boost > 0')
        .tooltip(@click='goChest'  :class='{here: $store.state.upgrades.mode === "chest"}')
          .tooltiptext(v-if='$store.getters.member.tooltips')
              p.suggest points
          label.stash(v-if='card.boost') {{ card.boost.toFixed(2) }}
          label.stash(v-else) 0
    .clearboth
    
</template>

<script>

import Bird from './Bird'
import Current from './Current'

export default {
    props: ['m'],
    components: {Bird, Current},
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
        goDoge(){
            this.$store.commit('setMode', 0)
        },
        goBadge(){
            if(this.$store.state.upgrades.mode !== 'badge') {
            } else {
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
@import '../styles/tooltips'

.tooltiptext.v
    position: absolute
    left: 3em

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
    font-size: 1.246em
    font-weight: normal;
    margin: 1em
    display: block

.hackername
    font-family: monospace
    font-size: 1.5em

.spacer
    margin-bottom: 3em

.membershipcard
    padding: 1em
    background: rgba(22, 22, 22, 0.2)
    text-align: center
    position: relative

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
    float: left
    width: fit-content
    position: relative
    bottom: 0
    left: 0
    cursor: pointer

.bottomright
    width: fit-content
    right: 0
    bottom: 0.65em
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
    text-align: center
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
