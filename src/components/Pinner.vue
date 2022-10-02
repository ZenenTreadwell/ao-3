<template lang='pug'>

.bird(:class='{itsapin:b.guild }')
    div(@click.stop='toggleSend')
        img.birdy(v-if='!showSend && !b.guild' src='../assets/images/badge.svg'  :class='{darkcircle: b.guild}')
        div.birdy.smallguild(v-else  :class='{ open : showSend, darkcircle: b.guild }')
    .guildcreate(v-if='showSend'  @click.stop  :class='{ bumpup : editing }')
        input(v-model='task.guild'  type='text'  :placeholder='task.guild'  @keypress.enter='titleIt(false)')
        button(@click='titleIt')
            span(v-if='b.guild === task.guild') un
            span pin
    span.theTitle(v-if='b.guild && !showSend') {{ b.guild }}

</template>

<script>

export default {
    props: ['b', 'inId'],
    data() {
        return {
            showGuildCreate: false,
            showSend:false,
            task: {
                guild: this.b.guild ? this.b.guild : '',
            },
        }
    },
    methods: {
        showSendOff(){
            this.showSend = false
        },
        toggleGuildCreate(){
            if(!this.showGuildCreate) {
                this.showSend = false
            }
            this.showGuildCreate = !this.showGuildCreate
            if(this.showGuildCreate) {
                setTimeout(()=>{ document.getElementById('titlebox').focus() }, 1)
            }
        },
        toggleSend(){
            if(!this.showSend) {
                this.showGuildCreate = false
            }
            this.showSend = !this.showSend
        },
        titleIt() {
            if(this.b.guild === this.task.guild) {
                this.task.guild = ''
                this.$store.dispatch("makeEvent", {
                    type: 'task-guilded',
                    taskId: this.b.taskId,
                    guild: false,
                })
            }
            this.$store.dispatch("makeEvent", {
                type: 'task-guilded',
                taskId: this.b.taskId,
                guild: this.task.guild,
            })
            this.showSendOff()
        },
    },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/button'
@import '../styles/donut'
@import '../styles/button'
@import '../styles/input'

img
    height: 1.1em

button
    width: 3em
    display: inline

.guildcreate
    background: transparent
    padding: 0
    input
        width: 69%
        display: inline-block;
    button
        width: 20%

.guildcreate button
    height: 2.2em
    padding: 0

.guildcreate input
    border-color: rgba(22, 22, 22, 1)
    border-width: 1px
    background-color: rgba(222, 222, 222, 0.3)
    height: 2.2em
    width: 60%

.guildcreate.bumpup
    top: 0.6em
    width: calc(100% - 7em)

.birdy
    float: left
    height: 1.4777em
    cursor: pointer
    opacity:0.5

.smallguild
    background-image: url('../assets/images/badge.svg')
    background-repeat: no-repeat
    background-size: contain
    background-position: top left
    height: 1.67em
    width: 1.7em
    opacity: 1
    position: relative
    z-index: 10

.darkcircle
    background-color: main
    border-radius: 50%

.itsapin
    height: .3em;

</style>
