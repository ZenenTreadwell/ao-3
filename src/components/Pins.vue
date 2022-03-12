<template lang='pug'>

.projects
    pin(v-for='p in pinList'  :p='p')
    pin(:p='$store.getters.memberCard')

</template>

<script>
import Pin from './Pin'
export default {
    components: { Pin },
    computed: {
        pinList(){
            return this.$store.getters.pinGroups.groupings
                .map(x => {
                    return this.$store.state.tasks[this.$store.state.hashMap[x[0]]]
                })
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'

.projects
    position: fixed 
    left: 0.07em 
    bottom: 0.07em
    z-index: 40000000
    color: lightGrey
    font-style: italic;
    border-radius: 3%

img.floatleft
    max-height: 1em

.floatleft
    height: 100%
    float: left
    clear: both
    max-height: 3.3em
    cursor: crosshair
    margin-top: 0.3em
    padding-left: .5em

.gui
    font-size: 1.5em
    cursor: pointer

</style>
