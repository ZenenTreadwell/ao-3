<template lang="pug">
.day( :ondrop='drop'    :ondragover="allowDrop"   :ondragleave='offDrop'  :class='{dropping}')
    .date {{ day }}
    img.today(v-if='isToday'  src='../assets/images/down.svg'  draggable='false')
    span(v-if='createdToday') *
    span(v-for='t in ev')
        .upgrade(v-if='!t.type')
            img.upgrade.doge(v-if='checkIsMember(t.name)'  @dblclick="goDeeper(t.taskId)"  src='../assets/images/doge.svg')
            img.upgrade(v-else  @dblclick="goDeeper(t.taskId)"  src='../assets/images/uncompleted.svg'  :class='styl(t.color)'  draggable="true"  :ondragstart='dragStartWrap(t.taskId)')
        .upgrade(v-else-if='t.type === "resource-used"')
            img.completedcheckmark(@dblclick="goDeeper(t.resourceId)"  src='../assets/images/down.svg')
        span.plain.completedcheckmark(v-else-if='t.type === "task-claimed"'  @dblclick='goDeeper(t.taskId, t.inId)' :class='{smaller: ev.length > 15}' )
            img.completedcheckmark.doge(v-if='t.taskId === $store.getters.contextCard.taskId'  src='../assets/images/doge.svg')
            img.completedcheckmark(v-else   :class='styl(getCardColor(t.taskId))'  src='../assets/images/completed.svg')

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
    data(){
        return { dropping: false }
    },
    components: { Linky, Current, Currentr },
    props: ['day', 'month', 'year', 'inId', 'ev', 'isToday'],
    computed: {
        createdToday(){
            let createdDate = getDMY(this.$store.getters.contextCard.createdTs)
            return createdDate.day === this.day && createdDate.month === this.month && createdDate.year === this.year
        }
    },
    methods: {
        offDrop(){
            this.dropping = false
        },
        dragStartWrap(tId){
            return (ev) => {
                ev.dataTransfer.setData("taskId", tId)
            }
        },
        allowDrop(ev){
            ev.preventDefault()
            this.dropping = true
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
            if (!color  || this.$store.getters.member.stacks === 1) return
            return {
                redwx : color == 'red',
                bluewx : color == 'blue',
                greenwx : color == 'green',
                yellowwx : color == 'yellow',
                purplewx : color == 'purple',
                blackwx : color == 'black',
            }
        },
        goDeeper(taskId, inId){
            if (inId) this.$store.commit("goDeeper", inId);
            if (taskId) this.$store.commit("goDeeper", taskId);
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
            let task = this.$store.state.tasks[this.$store.state.hashMap[tId]]
            if (task) return task.color
            return 'red'
        },
        checkIsMember(name){
            return this.$store.state.members.some(m => m.memberId === name)
        }
    },
}
</script>

<style lang='stylus' scoped>

@import '../styles/colours';

.doge
    background: main
    border-radius: 50%
    padding: 0.1em

.day.dropping
    background: blue

.upgrade
    height: 0.99em
    display: inline

.upgrade.doge
    height: 1.89em

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
    background-color: lightGrey

.day:hover
    border-style: dashed
    border-color: softGrey

.date
    text-align:right
    height: 1.7em
    margin-top: 0
    margin-bottom:-30px
    font-weight: bolder
    font-size: .8em
    padding: 2px 2px 2px 2px
    float: right
    z-index: 5
    position: relative
    pointer-events: none

img.completedcheckmark
    height: .99em

.plain
    text-decoration: none
    margin-right: 0.13em

.smaller  img
    height: 0.33em

</style>
