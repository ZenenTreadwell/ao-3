<template lang='pug'>

span.linky
    span.noheight(v-if='!isLock'  v-html='m')
    div(v-else)
        span - encrypted
    span
        slot
</template>

<script>

import markdown from 'markdown-it'
let md = new markdown({
  html: true,
  linkify: false,
  typographer: true,
  breaks: true,
});

export default {
    name: 'linky',
    props: ['x'],
    computed: {
        m(){
            let m2 = md.render(this.x)
            return m2
        },
        isLock(){
            return this.x.slice(0,7) === '__lock:'
        }
    },
}

</script>


<style lang='stylus'  scoped>

img
    height: 1.19em

.linky
    word-wrap: anywhere;
    display: inline-block;

.centered
    text-align: center
    width: 100%

.noheight p
    margin: 0

.linky .noheight img
    max-width: 100%

.cardname.front .linky .noheight img
    max-width: 100%

.priority .closedcard .linky img, .priority.closedcard .linky img
    max-height: 12em
    margin-left: 50%
    transform: translateX(-50%)

p:last-child
    margin-bottom: 0

.noheight h1, .noheight h2, .noheight h3, .noheight h4, .noheight h5, .noheight h6
    margin-top: 0

.noheight h1
    font-size: 1.675em
    margin-bottom: 0.5em

.noheight h2
    font-size: 1.4em
    margin-bottom: 0.625em

.noheight h3
    margin-bottom: 0.9em

.noheight h4
    margin-bottom: 1.33em
</style>
