<template lang='pug'>

.upgrades(@click.stop)
    task-calendar(:inId='$store.getters.contextCard.taskId')
    resource-book(:tId='$store.getters.contextCard.taskId'  v-if='!$store.state.upgrades.chosenDay')
</template>

<script>

import TaskCalendar from './Calendar'
import ResourceBook from './ResourceBook'

export default {
    components:{
        ResourceBook, TaskCalendar
    }
}

</script>

<style lang='stylus' scoped>

.upgrades
    width: 100%

</style>
