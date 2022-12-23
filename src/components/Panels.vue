<template lang='pug'>

.panel(v-if='$store.getters.contextCard') 
    .flexrow
      .pile
          stack(stack='red', :position='$store.getters.contextCard.stackView["red"]',  :taskId='$store.getters.contextCard.taskId')
          span &nbsp;
      .pile
          stack(stack='green', :position='$store.getters.contextCard.stackView["green"]',  :taskId='$store.getters.contextCard.taskId')
          span &nbsp;
      .pile
          stack(stack='blue', :position='$store.getters.contextCard.stackView["blue"]',  :taskId='$store.getters.contextCard.taskId')
    .flexrow
      .offsetter &nbsp;
      .pile
          stack(stack='yellow', :position='$store.getters.contextCard.stackView["yellow"]',  :taskId='$store.getters.contextCard.taskId')
      .pile
          stack(stack='purple', :position='$store.getters.contextCard.stackView["purple"]',  :taskId='$store.getters.contextCard.taskId')
      .offsetter &nbsp;

</template>

<script>
import Stack from './Stack'

export default {
  components:{ Stack },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'

.panel
    margin: 0 1em 1em 1em
    clear: both
    min-height: 5.9em
    max-width: 800px
    margin: auto
    background-size: cover
    background-position: center center
    overflow: visible
.flexrow
    display: flex 

.pile 
    flex: 3 3 min-content
    padding-left: .2em
    padding-right: .2em
    min-width: 6.04321em

.offsetter
    flex-grow: 1

</style>
