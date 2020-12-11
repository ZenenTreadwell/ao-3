<template lang='pug'>

.linky
    div.noheight(v-html='m')
</template>

<script>

import markdown from 'markdown'

export default {
    name: 'linky',
    props: ['x'],
    computed: {
        linkifiedName(){
            var text = this.x
            var regex = /((http|ftp|https):\/\/)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z0-9]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
            var linkedtext = text.replace(regex, function (url) {
              var linkedurl = url
              var hasprotocolregex = /((http|ftp|https):\/\/)/i
              if(hasprotocolregex.exec(url) === null) {
                linkedurl = "http://" + url
              }
              linkedurl = "<a href='" + linkedurl + "' target='_blank'>" + url + "</a>"
              return linkedurl
            } );
            return linkedtext
        },
        m(){
            return markdown.markdown.toHTML(this.x)
        }
    },
    data: function() {
        return {
            anchorAttributes: {
                target: '_blank',
                rel: 'noopener noreferrer nofollow'
            },
        }
    }
}

</script>


<style lang='stylus'>
// adding scoped causes ui bugs in context rows I do not understand how (ghosts)
.linky
    word-wrap: break-word;

.centered
    text-align: center
    width: 100%

.noheight p
    margin-top: 0
    margin-bottom: 1em

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
