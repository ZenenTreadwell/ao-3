<template lang='pug'>

.pin(v-if='p.taskId !== $store.getters.contextCard.taskId'  @click='goIn(p.taskId)'  :ondrop="drop"  :ondragover="allowDrop"  :ondragleave="offDrop"  :class="{dropping}"  draggable="true"  :ondragstart='dragStart')
    span(@click.stop='goInKeep(p.taskId)')
        img.floatleft(src='../assets/images/badge.svg')
    span()
        span.nl.gui.smaller {{ p.guild.split(':')[0] }}
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
        goInKeep(taskId){
            if (taskId === this.$store.getters.contextCard.taskId){
                this.$store.dispatch("goIn", {
                    panel: [this.$store.getters.member.memberId],
                    top: 0,
                    parents: []
                })
                return
            }
            let parents = this.$store.state.context.parent
            parents.push(this.$store.getters.contextCard.taskId)
            let panel = [taskId]
            let top = 0
            let goInObj = {panel, top, parents}
            this.$store.dispatch("goIn", goInObj)
        },
        goIn(taskId){
            let t = this.$store.state.tasks[this.$store.state.hashMap[taskId]]
            let parents = [] // [this.$store.getters.contextCard.taskId]
            let panel = [taskId]
            let top = 0

            // add same pin to context
            this.$store.getters.guilds.forEach(g => {
                let baseG = g.guild.split(':')[0]
                let baseT = t.guild.split(':')[0]
                if (baseG === baseT  && g.taskId !== t.taskId){
                    parents.push(g.taskId)
                }
            })
            let goInObj = {panel, top, parents}
            console.log({panel, top, parents})
            this.$store.dispatch("goIn", goInObj)
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

span.nl.gui.smallest
    font-size: 1.1em

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
