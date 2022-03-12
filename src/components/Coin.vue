<template lang='pug'>
.d
    img.dogepepecoin(@click='toggleGrab'  v-if='$store.getters.member.memberId !== b.taskId'  @mouseover='hoverthumb=true'  @mouseleave='hoverthumb=false'  :class="{ ungrabbedcoin : !isGrabbed, hoverthumb: hoverthumb }" src='../assets/images/thumbsup.svg'  draggable='false')
    img.dogepepecoin(v-else  src='../assets/images/timecube.svg')
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

.d
    display: inline-block;

.dogepepecoin
  display:inline-block;
  width: 33px
  cursor: pointer

.ungrabbedcoin
    opacity: 0.869
    transform: rotate(180deg)

img.dogepepecoin.hoverthumb
    opacity: 0.9169
    transform: rotate(-90deg)

img.dogepepecoin.hidden
    opacity: 0

</style>
