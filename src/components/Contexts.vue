<template lang='pug'>
#contexts.contexts
    div
        .transparentsides
    .spacer
    .narrow(v-for='(n, i) in $store.state.context.slice(0, $store.state.context.length - 1)'  :key='n' :style="{ marginLeft: (($store.state.context.length - 1 - i) * 0.5) + 'em', marginRight: (($store.state.context.length - 1 - i) * 0.5) + 'em' }")
        context-row(:taskId='n')
</template>

<script>

import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
import ContextRow from './ContextRow'

export default {
    data(){
        return {
            selfPropagating: false
        }
    },
    mounted(){
        let el = document.getElementById('contexts')
        let mc = Propagating(new Hammer.Manager(el))
        let longPress = new Hammer.Press({ time: 400 })

        mc.add(longPress)

        mc.on('press', (e) => {
            this.$store.state.tasks.forEach(t => {
                if (
                    t.subTasks.indexOf(this.$store.getters.contextCard.taskId) !== -1  ||
                    t.priorities.indexOf(this.$store.getters.contextCard.taskId) !== -1 ||
                    t.completed.indexOf(this.$store.getters.contextCard.taskId) !== -1
                ){
                    if(this.$store.state.context.indexOf(t.taskId) === -1){
                        this.$store.commit("addParent", t.taskId)
                    }
                }
            })
            this.selfPropagating = true
            setTimeout(()=> this.selfPropagating = false,1234)
            e.stopPropagation() // XXX requires propagating-hammerjs??
        })
    },
    components: { ContextRow },
    computed: {
        cardInputSty() {
          let color = this.$store.getters.contextCard.color
          return {
              redwx : color == 'red',
              bluewx : color == 'blue',
              greenwx : color == 'green',
              yellowwx : color == 'yellow',
              purplewx : color == 'purple',
              blackwx : color == 'black',
          }
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours';

.narrow
    padding-left: 4em
    padding-right: 4em

.contexts
    opacity: 0.9
    z-index: 9009
    background: transparent
    min-height: 3.35em
    display: flex
    flex-direction: column

.spacer
    flex-grow:1

</style>
