<template lang='pug'>

.context.paperwrapper(@click='goHigher'  :class="cardInputSty"  draggable="true"  :ondrop="drop"  :ondragover="allowDrop"  :ondragstart='dragStart'  :ondragleave='dragLeave')
    .popup
        .here
            span.front(v-if='isMember')  {{ isMember }} &nbsp;
            span.front(v-else-if='isResource')  {{ isResource }} &nbsp;
            span(v-else)
                span.front(v-if='card.guild')  {{ card.guild }} &nbsp;
                linky.front.only(:x='name'  :key='name')
    img.front.darkcircle(v-if='card.guild'  src="../assets/images/badge.svg")
    img.front.darkcircle(v-if='isMember' src="../assets/images/doge.svg")
    div.right.front(v-if='card.book.startTs')
        tally(:b='card')
    slot
</template>

<script>
import Linky from './Linky'
import Tally from './Tally'

export default {
    data(){
        return { dropping: false }
    },
    props: ['taskId'],
    components: { Linky, Tally },
    methods: {
        goHigher(){
            let t = this.$store.state.tasks[this.$store.state.hashMap[this.taskId]]
            if (
                t.guild &&
                this.$store.getters.uniqGuilds.map(g => g.guild.split(':')[0]).indexOf(t.guild.split(':')[0]) > -1
            ){
                console.log('dont go higher?')
                let contexts = []
                this.$store.getters.guilds.forEach(g => {
                    let baseG = g.guild.split(':')[0]
                    let baseT = t.guild.split(':')[0]
                    if (baseG === baseT  && g.taskId !== t.taskId  && g.taskId !== this.taskId){
                        contexts.push(g.taskId)
                    }
                })
                contexts.reverse().push(this.taskId)
                return this.$store.commit("goGo", contexts)
            }
            this.$store.commit("goHigher", this.taskId)
        },
        dragLeave(){
            this.dropping = false
        },
        drop(ev){
            ev.preventDefault();
            var data = ev.dataTransfer.getData("taskId")
            if (this.taskId === data){
                return
            }
            this.$store.dispatch("makeEvent", {
                type: 'task-de-sub-tasked',
                inId: this.$store.getters.contextCard.taskId,
                taskId: data,
            })
            this.$store.dispatch("makeEvent", {
                type: 'task-sub-tasked',
                inId: this.taskId,
                taskId: data,
            })
            setTimeout(() => this.dropping = false, 444)
        },
        allowDrop(ev){
            ev.preventDefault()
            this.dropping = true
        },
        dragStart(ev){
            ev.dataTransfer.setData("taskId", this.taskId);
        },
    },
    computed: {
        isResource(){
            let is = false
            this.$store.state.resources.some(m => {
                if (m.resourceId === this.taskId){
                    is = m.name
                    return true
                }
            })
            return is
        },
        isMember(){
            let is = false
            this.$store.state.members.some(m => {
                if (m.memberId === this.taskId){
                    is = m.name
                    return true
                }
            })
            return is
        },
        name(){
            return this.card.name
        },
        card(){
            return this.$store.state.tasks[this.$store.state.hashMap[this.taskId]]
        },
        cardInputSty() {
          if (this.$store.getters.member.stacks === 1){
              return {
                  nowx: true,
                  dropping: this.dropping,
              }
          }
          let color = this.card.color
          return {
              dropping: this.dropping,
              redwx : color == 'red',
              bluewx : color == 'blue',
              greenwx : color == 'green',
              yellowwx : color == 'yellow',
              purplewx : color == 'purple',
              blackwx : color == 'black',
          }
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'

img
    height: 1.1em
    float: left
    margin-left: 1em
    padding: 0em 0.1em 0.1em 0.1em

img.darkcircle
    background: main
    border-radius: 50%

.context
    opacity: 0.9
    width: calc(100% + 1em)

.paperwrapper
    position: relative
    z-index: 1

.popup
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: relative
    width: 100%
    height: 1.5em
    cursor: pointer
    z-index: 50
    overflow: hidden

.popup .here .only
    opacity: 0.15
.popup:hover .here .only
    opacity: 1

.here
    position: inline

    pointer-events: none
    margin-left: 2.5em

img.front
    position: absolute
    top: 0.2em
    left: -0.5em

.right.front
    position: absolute
    top: 0.2em
    right: 0.5em

.right.front img
    margin-right: 0.5em
    margin-left: 0.15em

.front
    z-index: 100
    position: relative
    pointer-events: none

.right.front
    float: right

.context
    box-shadow: -7px -7px 7px 1px rgba(21, 21, 21, 0.5)


.context.paperwrapper.dropping
    background: blue

</style>
