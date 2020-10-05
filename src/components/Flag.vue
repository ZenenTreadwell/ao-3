<template lang='pug'>
.flag(v-if="$store.getters.memberCard")
    .flaggy(:id='uuid'  :class='flagClass')
        img.svgwhite.faded(src='../assets/images/upboat.svg'  :class='{hidden:!$store.getters.member.guides}')

</template>

<script>
import _ from 'lodash'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
import uuidv1 from 'uuid/v1'

export default {
    data(){
        return {
            uuid: uuidv1(),
        }
    },
    props: ['b', 'inId'],
    mounted() {
        let el = document.getElementById(this.uuid)
        if(!el) return
        let mc = Propagating(new Hammer.Manager(el))

        let Tap = new Hammer.Tap({ time: 400 })
        mc.add(Tap)
        mc.on('tap', (e) => {
            if (this.isTop){
                this.dogeIt()
            } else {
                this.flagIt()
            }
            e.stopPropagation()
        })

        let Press = new Hammer.Press({ time: 400 })
        mc.add(Press)
        mc.on('press', (e) => {
            this.pilePrioritized()
            e.stopPropagation()
        })

        let Swipe = new Hammer.Swipe()
        mc.add(Swipe)
        mc.on('swipeleft', (e) => {
            this.$store.dispatch('previousUpgradeMode')
            e.stopPropagation()
        })

        mc.on('swiperight', (e) => {
            e.stopPropagation()
        })
    },
    methods: {
        complete(){
            this.$store.dispatch("makeEvent", {
                type: 'task-claimed',
                inId: this.inId,
                taskId: this.b.taskId,
                memberId: this.$store.getters.member.memberId,
                notes: 'checked by ' + this.$store.getters.member.memberId
            })
        },
        uncheck(){
            this.$store.dispatch("makeEvent", {
                type: 'task-unclaimed',
                taskId: this.b.taskId,
                memberId:  this.$store.getters.member.memberId,
                notes: ''
            })
        },
        pilePrioritized(){
            let colorIds = this.$store.getters[this.b.color].map(t => t.taskId)
            let isOneOf = colorIds.indexOf(this.b.taskId) > -1
            if (this.$store.getters.member.stacks === 5 && isOneOf){
                this.$store.dispatch("makeEvent", {
                  type: 'pile-prioritized',
                  tasks: colorIds,
                  inId: this.$store.getters.contextCard.taskId,
                })
            }
        },
        deckIt(){
            this.$store.dispatch("makeEvent", {
                type: 'task-sub-tasked',
                subTask: this.b.taskId,
                taskId: this.$store.getters.memberCard.taskId,
            })
        },
        flagIt(){
                let parentId = this.$store.state.context.parent[this.$store.state.context.parent.length-1]

                if (this.inId){
                    this.$store.dispatch("makeEvent", {
                      type: 'task-prioritized',
                      taskId: this.b.taskId,
                      inId: this.inId,
                    })
                } else if (parentId) {
                    this.$store.dispatch("makeEvent", {
                      type: 'task-prioritized',
                      taskId: this.b.taskId,
                      inId: parentId,
                    })

                    let p = _.filter(this.$store.state.context.panel,(p)=> p !==  this.b.taskId)

                    if (p.length < 1){
                        this.$store.dispatch('goUp', {
                          target: parentId,
                          panel: [parentId],
                          top: 0
                        })
                    } else {
                        this.$store.commit('setPanel', p)
                        this.$store.commit('setTop', this.$store.state.context.top % p.length)
                    }
                }
                if(this.$store.state.upgrades.mode !== 'boat') {
                    this.$store.commit("setMode", 1)
                }
        },
        dogeIt(){
            if(!this.isDoged) {
                this.$store.dispatch("makeEvent", {
                  type: 'task-prioritized',
                  taskId: this.b.taskId,
                  inId: this.$store.getters.memberCard.taskId,
                })
            } else {
                this.$store.dispatch("makeEvent", {
                  type: 'task-refocused',
                  taskId: this.b.taskId,
                  inId: this.$store.getters.memberCard.taskId,
                })
            }
        }
    },
    computed: {
        flagClass(){
            return {
                boat : (this.$store.state.upgrades.mode === "boat" || this.$store.state.upgrades.mode === "doge") && !this.isDoged,
                doge : (this.$store.state.upgrades.mode === "boat" || this.$store.state.upgrades.mode === "doge") && this.isDoged,
                chest : this.$store.state.upgrades.mode === "chest",
                timecube : this.$store.state.upgrades.mode === "timecube"
            }
        },
        isDoged() {
            return this.$store.getters.memberCard.priorities.indexOf(this.b.taskId) > -1
        },
    },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours';
@import '../styles/skeleton';
@import '../styles/grid';
@import '../styles/button';

.flag, .opened
    width: 100%

.count
    float: right

.activated
    border-style: solid
    border-width: thick
    border-color: white

.upgrade
    height: 3em

.task
    color: white
    margin:10px 0
    padding:20px

.flaggy
    position: absolute
    right: 1em
    top: 1em
    height: 1em
    cursor: pointer
    z-index: 99

.flaggy img
    height: 100%

.doge
    height: 1.3em
    margin-top: -0.1em
    margin-right: -0.1em

.chest, .timecube
    height: 1.1em
    margin-top: -0.2em
    margin-right: -0.2em

.boat
    height: 1em
    margin-top: -0.2em
    margin-right: -0.4em

.faded
    opacity: 0.235654

.svgwhite
    fill: white

.svgwhite:hover
    transform: rotate(-30deg)
    opacity: 1

.opened
    float: left

.hidden
    opacity: 0

.hidden:hover
    opacity: 0.25654
</style>
