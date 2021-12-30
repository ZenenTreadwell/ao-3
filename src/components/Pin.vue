<template lang='pug'>

.pin(@click='goGo(p.taskId)'  :ondrop="drop"  :ondragover="allowDrop"  :ondragleave="offDrop"  :class="{dropping}"  draggable="true"  :ondragstart='dragStart')
    span(@click.stop='goGoKeep(p.taskId)')
        img.floatleft(v-if='$store.getters.member.memberId !== p.taskId'  src='../assets/images/badge.svg')
        img.floatleft(v-else  src='../assets/images/doge.svg')
    span()
        span.nl.gui(v-if='$store.getters.member.memberId !== p.taskId' ) {{ p.guild.split(':')[0] }}
        span.nl.gui(v-else) &nbsp;home
</template>

<script>

export default {
    data(){
        return { dropping: false }
    },
    props: ['p'],
    methods: {
        dragStart(ev){
            ev.dataTransfer.setData("taskId", this.p.taskId);
        },
        offDrop(){
            this.dropping = false
        },
        drop(ev){
            ev.preventDefault();

            var data = ev.dataTransfer.getData("taskId")
            if (this.p.taskId === data){
                return
            }
            this.$store.dispatch("makeEvent", {
                type: 'task-de-sub-tasked',
                inId: this.$store.getters.contextCard.taskId,
                taskId: data,
            })
            this.$store.dispatch("makeEvent", {
                type: 'task-sub-tasked',
                inId:  this.p.taskId,
                taskId: data,
            })
            setTimeout(() => this.dropping = false, 444)
        },
        allowDrop(ev){
            ev.preventDefault()
            this.dropping = true
        },
        goGoKeep(taskId){
            this.$store.commit("goDeeper", taskId)
        },
        goGo(taskId){
            let t = this.$store.state.tasks[this.$store.state.hashMap[taskId]]
            let contexts = [] // [this.$store.getters.contextCard.taskId]

            // add same pin to context
            let baseT = t.guild.split(':')[0]
            if (baseT !== ''){
                this.$store.getters.guilds.forEach(g => {
                  let baseG = g.guild.split(':')[0]
                  if (baseG === baseT  && g.taskId !== t.taskId){
                    contexts.push(g.taskId)
                  }
                })
            }
            contexts.push(taskId)
            this.$store.commit("goGo", contexts)
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'

.selected
    font-weight: 900;
    font-size: 1.19em

.dropping
    background: blue

span.nl.gui
    font-size: 1.1em
    opacity: 0.3
span.nl.gui:hover
    opacity: 1

.projects .floatleft
    max-height: 1.5em
    margin-top: 0

.projects ul
    margin-left: -2em

.gui
    font-size: 1.5em
    cursor: pointer

.spaced
    clear: both
    margin-top: 0.9555em

.floatleft
    height: 100%
    float: left
    clear: both
    max-height: 3.3em
    cursor: crosshair
    margin-top: 0.3em

</style>
