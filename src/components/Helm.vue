<template lang='pug'>

.helm
    .topcenter(@click='nextMode')
        span.quarter(@click.stop='chooseMode(1)'  :class='{selected: $store.state.upgrades.mode === "boat"}')
        span.quarter(@click.stop='chooseMode(2)'  :class='{selected:$store.state.upgrades.mode === "timecube"}')
        span.quarter(@click.stop='chooseMode(3)'  :class='{selected:$store.state.upgrades.mode === "chest"}')
        span.quarter(@click.stop='chooseMode(4)'  :class='{selected:$store.state.upgrades.mode === "badge"}')

</template>

<script>

export default {
    methods: {
        nextMode() {
            this.$store.commit('nextMode')
        },
        chooseMode(x){
          if (this.$store.state.upgrades.modes[x] === this.$store.state.upgrades.mode){
              return this.$store.commit('setMode', 0)
          }
          this.$store.commit('setMode', x)
        }
    },
}

</script>

<style lang="stylus" scoped>

@import '../styles/grid';
@import '../styles/colours';
@import '../styles/tooltips';

.quarter
    display: inline-block
    width: 25%
    font-size: 4.44em
    color: lightGrey
    max-height: 2em
    margin-top: -0.35em;

.selected
    color: wrexgreen

.quarter:before
    content: "\2022";

.quarter:hover
    color: wrexgreen

.upg
    height: 2em
    pointer-events: none

.topcenter
    position: fixed
    top: 0
    left: 50%
    transform: translateX(-50%)
    width: 10em
    height: 2em
    max-width: 33%
    background: main
    color: main
    padding-left: 2em
    padding-right: 2em
    padding-top: .29em
    padding-bottom: .29em
    z-index: 77777
    border-bottom-left-radius: 10%
    border-bottom-right-radius: 10%
    border: solid
    border-top: none
    border-width: 5px
    border-color: lightGrey
    cursor: pointer

</style>
