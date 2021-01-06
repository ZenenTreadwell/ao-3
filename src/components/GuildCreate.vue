<template lang='pug'>

.guildcreate(:class='{ bumpup : editing }')
    input(v-model='task.guild'  type='text'  :placeholder='task.guild'  @keypress.enter='titleIt(false)')
    button(@click='titleIt') #
</template>

<script>

export default {
    props: ['b', 'showSendOff'],
    data() {
        return {
            task: {
                guild: this.b.guild? this.b.guild : '',
            }
        }
    },
    methods: {
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
        }
    },
    computed: {
        detectRename(){
            if(this.b.guild === this.task.guild) {
                return "clear"
            }
            return "label"
        }
    },
}

</script>

<style lang='stylus' scoped>

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
    background-color: rgba(22, 22, 22, 0.3)
    height: 2.2em
    width: 60%

.guildcreate.bumpup
    top: 0.6em
    width: calc(100% - 7em)
</style>
