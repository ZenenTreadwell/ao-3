<template lang='pug'>

.projects
    ul.none()
        li.spaced(v-for='p in $store.getters.uniqGuilds'  :key='p.taskId'  :ondrop="dropLoader(p.taskId)"  :ondragover="allowDrop")
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
        dropLoader(guildId){
            return (ev) => {
                ev.preventDefault();
                var data = ev.dataTransfer.getData("taskId")
                this.$store.dispatch("makeEvent", {
                  type: 'task-sub-tasked',
                  taskId: guildId,
                  subTask: data,
                })
            }
        },
        allowDrop(ev){
            ev.preventDefault()
        },
        goIn(taskId){
            let t = this.$store.state.tasks[this.$store.state.hashMap[taskId]]
            let parents = [this.$store.getters.contextCard.taskId]
            let panel = [taskId]
            let top = 0

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

.nl
    text-decoration:none

h3
    text-align: left
    font-family: 'Open Sans', light, sans-serif;

.box
    padding: 1em 0

.centerchildren
    text-align: center;

.gui
    font-size: 1.5em
    cursor: pointer

.row .three
    height: 5em

.spaced
    clear: both
    margin-top: 0.9555em

.fr
    float: right
    height: 3em

.floatleft
    height: 100%
    float: left
    clear: both
    max-height: 3.3em
    margin-right: 1em
    cursor: pointer
    margin-top: 0.3em

.title
    text-align: center
    font-size: 1.5em

.box
    width: 100%
    margin: 0 auto

.smallbox
    width: 4em
    margin-bottom: 1em

.adjusttop
    margin-top: 0.3em

.centerform
    margin: 0 auto 1em auto

h2
    text-align: center
    margin-top: 0

.checkwrapper
    overflow: auto
    width: 100%

.plain.checkmark
    font-size: 2em
    display: inline-block
    cursor: pointer

.plain
    text-decoration: none

.togglepayments
    margin: 0
    padding: 0
    text-align: center

.mainbkg
    background: main

.submode
    height: 6em
    width: 6em
    margin-bottom: 1em
    margin-top: 1em

.max
    height: 100%
    width: 100%

.endpad
    padding-top: 1em
    padding-bottom: 1em
    padding-right: 0
    padding-left: 1em

.endpadtwo
    padding-top: 1em
    padding-bottom: 0.5em

.suggest
    font-style: italic
    font-size: 1.2em
    text-align: center

.hodlsuggest, .dogep .hodlsuggest
    font-size: 1.15em

.none
    list-style-type: none
    margin-left: -1em

ul
    margin-block-end: 0

.projects
    margin-left: 2em
    padding: 0.2em
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
    margin-right: 0.4em

.projects ul
    margin-left: -2em

.projectlist
    font-size: 1.2em
    margin-top: 0.15em

.projectlist.aproject
    cursor: pointer
    font-style: italic
    white-space: nowrap
    margin-right: 0.48em

.projectlist > img
    display: inline-block
    float: none
    height: 1.1em
    margin-right: 0.225em
    position: relative
    top: 0.25em

.projectlist > img.first
    margin-left: 0

.smaller
    font-size: 1.3em

ul.none.indent
    margin-left: -0.5em

.projects .floatleft.smaller
    max-height: 1em
    margin-right: 0.4em

span.nl.gui.smallest
    font-size: 1.1em

</style>
