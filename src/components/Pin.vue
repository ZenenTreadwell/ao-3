<template lang='pug'>

.pin(@click='goGo'  :ondrop="drop"  :ondragover="allowDrop"  :ondragleave="offDrop"  :class="{dropping, hidded : $store.state.context.indexOf(p.taskId) > -1}"  draggable="true"  :ondragstart='dragStart')
  .poon
    span(@click.stop='goGoKeep')
        img.floatleft(v-if='$store.getters.member.memberId !== p.taskId'  src='../assets/images/badge.svg'  :class='{rotated: $store.state.context.indexOf(p.taskId) > -1}')
        img.floatleft(v-else  src='../assets/images/doge.svg')
    span
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
            this.$store.commit("rollStackPull", data)
            setTimeout(() => this.dropping = false, 444)
        },
        allowDrop(ev){
            ev.preventDefault()
            this.dropping = true
        },
        goGoKeep(){
            this.$store.commit("goDeeper", this.p.taskId)
        },
        goGo(){
            let contexts = [] 
            if (this.$store.getters.member.memberId !== this.p.taskId){
                this.$store.getters.pinGroups.groupings.some(g => {
                    if (g.indexOf(this.p.taskId) > -1){
                       contexts = g.filter(x => x !== this.p.taskId)
                       return true
                    }
                })
            }
            contexts.push(this.p.taskId)
            this.$store.commit("goGo", contexts)
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'

.hidded
    opacity: 0

.rotated
    transform: rotate(180deg)

.dropping
    background: blue

.pin .poon:hover
    background: main

span.nl.gui
    font-weight: 1300;
    font-size: 1.2em
    opacity: 1
    width: 100%
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
