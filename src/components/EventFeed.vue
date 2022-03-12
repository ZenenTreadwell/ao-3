<template lang="pug">

.eventfeed
  div(v-for='(e, i) in eventstream'  :key="i")
      transition(name='fade' v-if='e.showEvent'  v-bind:style="{ left: e.randomX }"  @click='goTo(e)').feed.wiggle
          img.bubble(src='../assets/images/down.svg')
          //- .float(:style='{ color: e.randomColors[0], left: e.randomXs[0], top: e.randomYs[0] }') {{ e.meme }}
              //- span(v-if='e.type==="task-created"'  :style='{ color: e.randomColors[1], left: e.randomXs[1], top: e.randomYs[1] }') -{{ e.name }}
</template>

<script>

export default {
    computed:{
        eventstream(){
            return this.$store.state.eventstream
        },
    },
    methods: {
        goTo(ev){
            if (ev.memberId){
                this.$store.commit('goDeeper',ev.memberId )
            }

            if (ev.subTask){
              this.$store.commit('goDeeper',ev.subTask )
            } else if  (ev.taskId){
              this.$store.commit('goDeeper',ev.taskId )
            }

            if (ev.inId){
                this.$store.commit('goDeeper',ev.inId )
            }

        }
    }
}
</script>

<style lang='stylus' scoped>
@import '../styles/breakpoints';
@import '../styles/colours';

.feed
    position: fixed
    top: 100vh - 20em
    left: 45%
    height: 4em
    width: 4em
    z-index: 10000000
    opacity: 0.456
    cursor: pointer

.feed img
    height: 4em
    width: 4em

img
    height: 170px
    position: absolute
    top: 0
    left: 0

// transition doesn't work
.fade-enter-active
    transition: top 7s

.fade-leave-active
    transition: top 7s
    top: -11em

.fade-enter
    top: 99%

.fade-leave-to /* .fade-leave-active below version 2.1.8 */
    top: -10em

@keyframes wiggle {
    0%, 100% { transform: translate(-16px, 0) }
    25% { transform: translate(-8px, 0) }
    50% { transform: translate(16px, 0) }
    75% { transform: translate(8px, 0) }
}

.wiggle {
  animation: wiggle 1s infinite
  transition-timing-function: ease
}

.float
    position: relative
    left: 30%
    top: 40%
    font-family: "Comic Sans MS"
    text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5)

.bubble
    opacity: 0.5
</style>
