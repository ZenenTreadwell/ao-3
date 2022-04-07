<template lang='pug'>

.memberrow(v-if='m.memberId'  :key='m.memberId'  :class='{loggedIn: m.memberId === $store.getters.member.memberId, dropping}'  @click='goGo(m.memberId)'  :ondrop="drop"  :ondragover="allowDrop"  :ondragleave='offDrop'  draggable='true'  :ondragstart='dragStart')
    .flexrow(v-if='b')
        .vouch(@click.stop)
            coin(:b='b')
        .name.ptr.bolder
            current(:memberId='m.memberId' @click.stop)
            br
            span.smaller(v-if='mia > 2') &nbsp;&nbsp; mia {{ mia }} 
        .pinlist
            span(v-for='x in rowsGuilds') {{x}} &nbsp;
            .absoright(@click='delayedPaymode' @click.ctrl='deleteUser'  :class='{loggedInText: m.memberId === $store.getters.member.memberId}')
                img.boosted(src='../assets/images/hourglass.svg'  v-if='m.action'  @click.stop='goGo(m.action)')
                img.boosted.doge(:class="{faded: !(b.boost > 0 && m.active)}"  src='../assets/images/doge.svg' )
                img.boosted.trash(v-if='mia > 18' @click.stop='deleteUser' src='../assets/images/trash.svg')
        
</template>

<script>
import _ from 'lodash'
import PreviewDeck from './PreviewDeck'
import Coin from './Coin'
import Current from './Current'


export default {
    data(){
        return { 
            dropping: false, 
            now: Date.now()
        }
    },
    props: ['m'],
    components: {PreviewDeck, Coin, Current},
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
            setTimeout(() => this.dropping = false, 444)
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
        goGo(taskId){
            this.$store.commit("goGo", [taskId])
            this.$store.commit("closeAll")
        },
        deleteUser(){
            console.log('trying to purge?', this.m.memberId)
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
        mia(){
            let m = (this.now - this.m.lastUsed) / 1000 / 60 / 60 / 24
            return parseInt(m)
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
        rowsGuilds(){
            let g = []
            this.$store.state.cash.pins.forEach(taskId => {
                let t = this.$store.state.tasks[this.$store.state.hashMap[taskId]]
                if (t.deck.indexOf(this.b.taskId) > -1){
                    g.push(t.guild.split(':')[0])
                }
            })
            let f = _.uniq(g)
            return f
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
    },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'

.memberrow
    padding: 0.33em
    margin-bottom: 0.33em
    background: lightGrey
    cursor: pointer
    box-shadow: 0 3px 10px rgb(0 0 0 / 0.2)
.memberrow.dropping
    background: blue
.flexrow
    display: flex
.name 
    flex: 3 3 auto 
.vouch 
    flex: 0 0 3em
.pinlist 
    flex: 7 7 auto
.doge
    background: main
    border-radius: 50%
    padding: .123em
.trash 
    background: main
    padding: .123em
.red
    color: darkred

.bolder
    font-weight: bolder;

.boosted
    height: 1.654321em

.hover:hover
    text-decoration: line-through;

.absoright
    float: right

img
    height: 4em

.faded
    opacity: 0.235654

.ptr
    cursor: pointer

.loggedIn
    opacity: 0.9

.smaller
    font-size: 0.5078em

</style>
