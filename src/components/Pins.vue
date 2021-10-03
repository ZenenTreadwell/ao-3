<template lang='pug'>

.projects
    pin(v-for='p in $store.getters.uniqGuilds'  :key='p.taskId'  :p='p')
</template>

<script>
import Pin from './Pin'
export default {
    components: { Pin }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'

.projects
    z-index: 40000000
    color: lightGrey
    font-style: italic;
    border-radius: 3%
    -webkit-text-stroke-width: 1px;
    -webkit-text-stroke-color: main;

</style>
