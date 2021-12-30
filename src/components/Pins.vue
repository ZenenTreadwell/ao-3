<template lang='pug'>

.projects
    pin(v-for='p in pinList'  :key='p.taskId'  :p='p')
    pin(v-if='$store.getters.member.memberId !== $store.getters.contextCard.taskId'  :p='$store.getters.memberCard')

</template>

<script>
import Pin from './Pin'
export default {
    components: { Pin },
    methods: {
      goHome(){
          this.$store.commit("goGo", [this.$store.getters.member.memberId])
      },
    },
    computed: {
        pinList(){
            if (
                this.$store.getters.contextCard.guild
            ){
                let pin = this.$store.getters.contextCard.guild.split(':')[0]
                return this.$store.getters.uniqGuilds.filter(g => {
                    return g.guild.split(':')[0] !== pin
                })
            } else {
                return this.$store.getters.uniqGuilds
            }
        }
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
