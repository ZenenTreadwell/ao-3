<template lang='pug'>

.projects
    pin(v-for='p in $store.getters.uniqGuilds'  :key='p.taskId'  :p='p')
    div(v-if='$store.getters.member.memberId !== $store.getters.contextCard.taskId'  @click='goHome')
        img.floatleft(src='../assets/images/doge.svg')
        span.nl.gui.smaller &nbsp;home

</template>

<script>
import Pin from './Pin'
export default {
    components: { Pin },
    methods: {
      goHome(){
          this.$store.commit("goGo", [this.$store.getters.member.memberId])
      },
    }
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
