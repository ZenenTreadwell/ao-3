<template lang='pug'>
.d(@click='toggleGrab')
    img.dogepepecoin(@mouseover='hoverthumb=true'  @mouseleave='hoverthumb=false'  :class="{ hidden: $store.getters.member.memberId === b.taskId, ungrabbedcoin : !isGrabbed, hoverthumb: hoverthumb }" src='../assets/images/thumbsup.svg'  draggable='false')
</template>

<script>

export default {
    data(){
        return {hoverthumb: false}
    },
    props: ['b'],
    computed: {
        isGrabbed(){
          return this.b.deck.indexOf(this.$store.getters.member.memberId) >= 0
        },
    },
    methods: {
        toggleGrab(){
            if(this.isGrabbed) {

                this.$store.dispatch("makeEvent", {
                    type: 'task-dropped',
                    taskId: this.b.taskId,
                    memberId: this.$store.getters.member.memberId,
                })
            } else {

                this.$store.dispatch("makeEvent", {
                    type: 'task-grabbed',
                    taskId: this.b.taskId,
                    memberId: this.$store.getters.member.memberId,
                })
            }
            this.hoverthumb = false
        },
    },
}

</script>

<style lang="stylus" scoped>

@import '../styles/spinners'

.dogepepecoin
  display:block
  width: 35px
  height: 35px
  // position: absolute
  // bottom: 3px
  // right: 3px
  cursor: pointer
  padding-top: .5em
  padding-bottom: .5em

.ungrabbedcoin
    opacity: 0.869
    transform: rotate(180deg)

img.dogepepecoin.hoverthumb
    opacity: 0.9169
    transform: rotate(-90deg)

img.dogepepecoin.hidden
    opacity: 0

</style>
