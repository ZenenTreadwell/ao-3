<template lang='pug'>

#newresource(:class='{shown: showSetTime}')
    div(v-if='showSetTime')
        .close(@click='showSetTime = false') x
        label select day
        input(v-model='ymd' type='date')
        label select hour
        .row.padd
            select.eight.grid(v-model='hour')
                option(value='1') 1
                option(value='2') 2
                option(value='3') 3
                option(value='4') 4
                option(value='5') 5
                option(value='6') 6
                option(value='7') 7
                option(value='8') 8
                option(value='9') 9
                option(value='10') 10
                option(value='11') 11
                option(value='12') 12
            select.four.grid(v-model='meridiem')
                option(value='am') am
                option(value='pm') pm
    button(@click='book')
        span schedule
</template>

<script>

export default {
    methods: {
        book(){
            console.log("current start", this.calcTime.start)
            if (!this.showSetTime) return this.showSetTime = true
            this.$store.dispatch('makeEvent', {
                type: 'resource-booked',
                resourceId: this.tId,
                memberId: this.$store.getters.member.memberId,
                startTs: this.calcTime.start,
                endTs: this.calcTime.end,
            })
            this.showSetTime = false
        }
    },
    data(){
        return {
            showSetTime: false,
            ymd: '',
            hour: 1,
            meridiem : 'pm',
            duration : 3,
            urlId: '',
        }
    },
    computed: {
        tId(){
            return this.$store.getters.contextCard.taskId
        },
        calcTime(){
            const HOUR = 60 * 60 * 1000
            let d = new Date(this.ymd)

            let pmAmOffset
            switch (this.meridiem) {
                case 'am':
                    pmAmOffset = 0
                    break
                case 'pm':
                    pmAmOffset = 12 * HOUR
                    break
            }

            let tzOffset = d.getTimezoneOffset()
            let timezoneOffset = ( tzOffset / 60 ) * HOUR

            let durationOffset = parseInt(this.duration) * HOUR
            let hourOffset = parseInt(this.hour) * HOUR

            let start = d.getTime() + pmAmOffset + hourOffset + timezoneOffset

            return {
                start,
                end: start + durationOffset
            }
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/grid'
@import '../styles/input'
@import '../styles/button'

.close
    float: right;
    padding: .3em;
    cursor: pointer;
    background: darkgray;
    border-radius: 10%;
    color: white;
    margin-bottom: .3em;
    width: 1.1em;
    text-align: center;
    
#newresource
    margin-bottom: -.17em

#newresource.shown
    padding: 1em

.br
    padding-top: 1.9em

// TODO: fix strange style stuff going on padding/margin on label not having effect
label
    padding-top: 1em
    margin-top: 1em

.padd
    padding-bottom: 1.1em

.centerform
    margin: 0 auto 1em auto

button
    padding: 0
    cursor: pointer
</style>
