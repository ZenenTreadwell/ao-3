<template lang='pug'>

.upgrades
    resource-book(:tId='$store.getters.contextCard.taskId')
    task-calendar(:inId='$store.getters.contextCard.taskId')
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
