<template lang="pug">
.day( :ondrop='drop'    :ondragover="allowDrop")
    .date {{ day }}
    img.today(v-if='isToday'  src='../assets/images/down.svg')
    span(v-if='createdToday') created
    span(v-for='t in ev')
        .upgrade(v-if='!t.type')
            img.upgrade.doge(v-if='checkIsMember(t.name)'  @cdbllick="goIn(t.taskId)"  src='../assets/images/doge.svg')
            img.upgrade(v-else  @click="goIn(t.taskId)"  src='../assets/images/uncompleted.svg'  :class='styl(t.color)')
        .upgrade(v-else-if='t.type === "resource-used"')
            img.completedcheckmark(@dblclick="goIn(t.resourceId)"  src='../assets/images/doge.svg'  :class='styl(t.color)')
        span.plain.completedcheckmark(v-else-if='t.type === "task-claimed"'  @dblclick='goIn(t.taskId)'  :class='styl(getCardColor(t.taskId))')
            img.completedcheckmark(v-if='checkIsMember(t.taskId)'  src='../assets/images/doge.svg'  :class='{smaller: ev.length > 15}')
            img.completedcheckmark(v-else  :class='{smaller: ev.length > 15}'  src='../assets/images/completed.svg')
    img.upgrade(v-if='isToday'  v-for='t in $store.getters.contextCard.priorities'  src='../assets/images/uncompleted.svg'  :class='styl($store.state.tasks[$store.state.hashMap[t]].color)')
</template>

<script>
import Linky from './Linky'
import Current from './Current'
import Currentr from './Currentr'

function getDMY(ts){
    let d = new Date(ts)
    let day =  d.getDate()
    let month = d.getMonth()
    let year = d.getFullYear()
    let hour = d.getHours()
    let minute = d.getMinutes()
    return { day, month, year, hour, minute }
}

export default {
    components: { Linky, Current, Currentr },
    props: ['day', 'month', 'year', 'inId', 'ev', 'isToday'],
    computed: {
        createdToday(){
            let createdDate = getDMY(this.$store.getters.contextCard.createdTs)
            return createdDate.day === this.day && createdDate.month === this.month && createdDate.year === this.year
        }
    },
    methods: {
        allowDrop(ev){
            ev.preventDefault()
        },
        drop(ev){
            ev.preventDefault();
            var data = ev.dataTransfer.getData("taskId")
            let d = new Date(this.year, this.month, this.day)
            let startTs = d.getTime()
            this.$store.dispatch("makeEvent", {
                type: 'resource-booked',
                inId: this.$store.getters.contextCard.taskId,
                memberId: this.$store.getters.member.memberId,
                resourceId: data,
                startTs,
                endTs: startTs + 123123,
            })
        },
        styl(color){
            if (!color) return
            return {
                redwx : color == 'red',
                bluewx : color == 'blue',
                greenwx : color == 'green',
                yellowwx : color == 'yellow',
                purplewx : color == 'purple',
                blackwx : color == 'black',
            }
        },
        goIn(taskId){
            let parents = []
            if (this.$store.getters.contextCard.taskId){
                parents.push(this.$store.getters.contextCard.taskId)
            } else if (this.$store.getters.memberCard.taskId){
                parents.push(this.$store.getters.memberCard.taskId)
            }
            this.$store.dispatch("goIn", {
                panel: [taskId],
                top: 0,
                parents
            })
            if(this.$store.state.upgrades.mode === 'doge' && this.$store.getters.contextCard.priorities.length > 0) {
                this.$store.commit("setMode", 1)
            }

        },
        cardDate(b){
            if ( b.book && b.book.startTs ) {
               let DMY = getDMY(b.book.startTs)
               return DMY.hour + ":" + DMY.minute.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})
            }
        },
        getCardName(tId){
            return this.$store.state.tasks[this.$store.state.hashMap[tId]].name
        },
        getCardColor(tId){
            return this.$store.state.tasks[this.$store.state.hashMap[tId]].color
        },
        checkIsMember(name){
            return this.$store.state.members.some(m => m.memberId === name)
        }
    },
}
</script>

<style lang='stylus' scoped>

@import '../styles/colours';

.upgrade
    height: 0.99em
    display: inline

.upgrade.doge
    height: 1.89em


.checkmark
    display: inline
    min-height: 1.5em
    margin-right: 2px
    img
        height: 1.5em

.guild
    color: black
    font-size: 0.5em

.today
    width: 100%
    height: 100%
    cursor: pointer
    opacity: 0.1
    display: inline-block
    position: absolute
    top: 0

.type
    font-size: .5em
    float: left
    white-space: nowrap;

.day
    position: relative
    overflow: visible

.day:hover
    background-color: softerGrey

.date
    text-align:right
    height: 1.7em
    margin-top: 0
    margin-bottom:-30px
    font-weight: bolder
    font-size: .4em
    padding: 2px 2px 2px 2px
    float: right
    z-index: 5
    position: relative
    pointer-events: none

.amount
    font-size: .49em
    position: absolute;
    bottom: 0;
    left: 0;

.inc
    color: accent2

.dec
    color: red

.b
		text-align: center
		border-radius: 8%
		color: main
		font-size: .8em

.p
		background-color: green
		border-right-style: solid
		border-color: green
.c
		background-color: green

.name

    font-size: 1.2em
    margin-right: 1em
    padding-bottom: .321em
    position: relative
    user-select: none

.checkmark
    margin-right: 0.25em

img.checkmark
    height: 2em

img.completedcheckmark
    height: .99em

.clickable
    cursor: pointer


.plain
    text-decoration: none
    margin-right: 0.13em

img.completedcheckmark.smaller
    height: 0.33em


</style>
