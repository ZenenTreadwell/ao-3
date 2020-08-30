<template lang='pug'>

.upgrades
    task-calendar(:inId='$store.getters.contextCard.taskId')
    connect(v-if='$store.getters.contextCard.taskId === $store.getters.member.memberId')
</template>

<script>

import calcs from '../calculations'
import TaskCalendar from './Calendar'
import ResourceBook from './ResourceBook'
import Connect from './Connect'

export default {
    components:{
        ResourceBook, TaskCalendar, Connect
    },
    computed: {
        calcTime(){
            if (this.$store.getters.contextCard.book.startTs){
                let mer = calcs.getMeridienTime(this.$store.getters.contextCard.book.startTs)
                return mer.month + '/' + mer.date + '/' + mer.year + " at " + mer.hour +  mer.meridien
            }
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/button'
@import '../styles/grid'

button
    margin-top: 2em
    opacity: 0.4

.upgrades
    width: 100%

.gui
    font-size: 1.5em
    cursor: pointer

</style>
