<template lang='pug'>

.memberrow(v-if='m.memberId'  :key='m.memberId'  :class='{loggedIn: m.memberId === $store.getters.member.memberId, dropping}'  @click='goIn(m.memberId)'  :ondrop="drop"  :ondragover="allowDrop"  :ondragleave='offDrop'  draggable='true'  :ondragstart='dragStart')
    .absoright(@click='delayedPaymode'  :class='{loggedInText: m.memberId === $store.getters.member.memberId}')
        span(v-if='!m.active'  @click.stop='deleteUser').hover delete
        span(v-if='b.boost > 0') {{b.boost.toLocaleString()}}
    .row(v-if='b')
        .three.grid.ptr
            current(:memberId='m.memberId' @click.stop)
        .one.grid(@click.stop)
            coin(:b='b')
        .grid.eight
            span(v-for='x in rowsGuilds') {{x}} &nbsp;

            //- simple-priorities(:taskId='m.memberId')
</template>

<script>

import PreviewDeck from './PreviewDeck'
import SimplePriorities from './SimplePriorities'
import Coin from './Coin'
import Current from './Current'

export default {
    data(){
        return { dropping: false }
    },
    props: ['m'],
    components: {PreviewDeck, SimplePriorities, Coin, Current},
    methods:{
        dragStart(ev){
            ev.dataTransfer.setData("taskId", this.m.memberId);
        },
        offDrop(){
            this.dropping = false
        },
        drop(ev){
            ev.preventDefault();

            var data = ev.dataTransfer.getData("taskId")
            if (this.m.memberId === data){
                return
            }
            this.$store.dispatch("makeEvent", {
                type: 'task-sub-tasked',
                inId:  this.m.memberId,
                taskId: data,
            })
        },
        allowDrop(ev){
            ev.preventDefault()
            this.dropping = true
        },
        delayedPaymode(){
            setTimeout(()=> {
                this.$store.commit("setMode", 3)
            },7)
        },
        goIn(taskId){
            this.$store.commit("closeAll")
            let panel = [taskId]
            let parents = [  ]
            let top = 0
            //
            // if (this.$store.getters.contextCard.taskId){
            //     parents.push(this.$store.getters.contextCard.taskId)
            // } else if (this.$store.getters.memberCard.taskId){
            //     parents.push(this.$store.getters.memberCard.taskId)
            // }

            this.$store.dispatch("goIn", {
                parents,
                top,
                panel
            })
            if(this.$store.state.upgrades.mode === 'doge' && this.$store.getters.contextCard.priorities.length > 0) {
                this.$store.commit("setMode", 1)
            }
        },
        deleteUser(){
            this.$store.dispatch("makeEvent", {
                type: 'member-purged',
                memberId: this.m.memberId,
            })
        },
        toggleGrab(){
            if (this.isVouched) {
                this.$store.dispatch("makeEvent", {
                    type: 'task-dropped',
                    taskId: this.b.taskId,
                    memberId: this.$store.getters.member.memberId,
                })
            } else {
                this.$store.dispatch("makeEvent", {
                    type: 'task-grabbed',
                    taskId: this.b.taskId,
                    memberId: this.$store.getters.member.memberId,
                    })
            }
        },
    },
    computed:{
        isLoggedIn(){
            let isLoggedIn
            this.$store.state.sessions.forEach( s => {
                if ( s.ownerId === this.m.memberId ){
                    isLoggedIn = true
                }
            })
            return isLoggedIn
        },
        rowsGuilds(){
            let g = []
            this.$store.getters.uniqGuilds.forEach(t => {
                if (t.deck.indexOf(this.m.memberId) > -1){
                    g.push(t.guild)
                }
            })
            return g
        },
        b(){
            return this.$store.state.tasks[this.$store.state.hashMap[this.m.memberId]]
        },
        isVouched(){
            return this.b.deck.indexOf( this.$store.getters.member.memberId ) > -1
        },
        hasAnyVouches(){
            return this.b.deck.length > 0
        },
        vouchCount(){
            let vouchCount = this.$store.getters.membersVouches.find(c => c.memberId === this.m.memberId)
            if(!vouchCount) return 0
            return vouchCount.count
        },
        vouchRatio(){
            let ratio = this.vouchCount / this.b.deck.length
            if(this.b.deck.length <= 0 && this.vouchCount > 0) return '-∞'
            else if(this.vouchCount === 0) return '0'
            else return ratio.toFixed(2)
        }
    },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/spinners'


.hover:hover
    text-decoration: line-through;

.absoright
    float: right

img
    height: 4em

label
    font-size: 1.246em
    font-weight: normal;
    margin: 1em

.memberrow
    padding-right: 0.33em
    padding-top: 0.33em
    margin-bottom: 0.33em
    background: lightGrey
    cursor: pointer
.memberrow.dropping
    background: blue

.fw
    width: 100%

.viney
    float: right
    height: 1.3em

.faded
    opacity: 0.235654

.yellowtx
    text-decoration: none

.dogepepecoin {
  width: 35px
  height: 35px
  cursor: pointer
  top: 1em
  position: relative
}

.hodlcount {
    position: relative
    top: calc(-1em + -15.5px)
    text-align: center
    width: 35px
    padding-bottom: 0
    margin-bottom: 0
    font-weight: bold
    color: rgba(255, 255, 255, 0.75)
    pointer-events: none
}

.grabbedhodlcount {
    color: white
}

.ungrabbedcoin {
    opacity: 0.3
}

.ptr
    cursor: pointer

.goldengun
    cursor: pointer
    height: 2em
    margin-top: 1em

.nopointer
    cursor: auto

.counts {
    position:relative
    top: 0
}

.iceblue
    color: #6ff
    text-align: center
    font-weight: bold
    margin-right: 2em

.loggedIn
    opacity: 0.9
    border-style: dashed
    border-color: main

</style>
