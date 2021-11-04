<template lang='pug'>

.pin(:ondrop="drop"  :ondragover="allowDrop"  :ondragleave="offDrop"  :class="{dropping}"  draggable="true"  :ondragstart='dragStart')
    span(@click='goInKeep(p.taskId)')
        img.floatleft(src='../assets/images/badge.svg')
    span(@click='goIn(p.taskId)')
        span(v-if='p.taskId === $store.getters.contextCard.taskId') &#9829;
        span.nl.gui.smaller {{ p.guild }}
        span(v-if='p.taskId === $store.getters.contextCard.taskId') &nbsp;&#9829;
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
            if (taskId === this.$store.getters.contextCard.taskId){
                this.$store.dispatch("goIn", {
                    panel: [this.$store.getters.member.memberId],
                    top: 0,
                    parents: []
                })
                return
            }
            let t = this.$store.state.tasks[this.$store.state.hashMap[taskId]]
            let parents = [] // [this.$store.getters.contextCard.taskId]
            let panel = [taskId]
            let top = 0

            // add same pin to context
            this.$store.getters.guilds.forEach(g => {
                if (g.guild === t.guild  && g.taskId !== t.taskId){
                    parents.push(g.taskId)
                }
            })
            let goInObj = {panel, top, parents}
            this.$store.dispatch("goIn", goInObj)
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'

.dropping
    background: blue

.projects .floatleft.smaller
    max-height: 1em
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
