<template lang='pug'>

.projects
    .spaced(v-for='p in $store.getters.uniqGuilds'  :key='p.taskId' :ondrop="drop"  :ondragover="allowDrop")
        span(@click='goIn(p.taskId)')
            img.floatleft(src='../assets/images/badge.svg')
        span(@click='goIn(p.taskId)')
            span(v-if='p.taskId === $store.getters.contextCard.taskId') *
            span.nl.gui.smaller {{ p.guild }}
            span(v-if='p.taskId === $store.getters.contextCard.taskId') *
</template>

<script>

export default {
    components: {},
    methods: {
        drop(ev){
            // not easy to get which project was dropped too?
            // seperate component for each row?
            ev.preventDefault();

            // var data = ev.dataTransfer.getData("taskId")
            // if (this.b.taskId === data){
            //     return
            // }
            // this.$store.dispatch("makeEvent", {
            //     type: 'task-de-sub-tasked',
            //     inId: this.$store.getters.contextCard.taskId,
            //     taskId: data,
            // })
            // this.$store.dispatch("makeEvent", {
            //     type: 'task-sub-tasked',
            //     inId: 'tId',
            //     taskId: data,
            // })
        },
        allowDrop(ev){
            ev.preventDefault()
        },
        goIn(taskId){
            // let t = this.$store.state.tasks[this.$store.state.hashMap[taskId]]
            let parents = [] // [this.$store.getters.contextCard.taskId]
            let panel = [taskId]
            let top = 0

            // this.$store.getters.guilds.forEach(g => {
            //     if (g.guild === t.guild  && g.taskId !== t.taskId){
            //         parents.push(g.taskId)
            //     }
            // })
            let goInObj = {panel, top, parents}
            this.$store.dispatch("goIn", goInObj)
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'

.projects .floatleft.smaller
    max-height: 1em
span.nl.gui.smallest
    font-size: 1.1em
.projects
    z-index: 40000000
    // margin-left: 2em
    // padding: 0.2em
    color: lightGrey
    font-style: italic;
    border-radius: 3%
    -webkit-text-stroke-width: 1px;
    -webkit-text-stroke-color: main;

.projects h3
    text-align: center
    margin-top: 0.5em
    margin-bottom: 0

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
    cursor: pointer
    margin-top: 0.3em

</style>
