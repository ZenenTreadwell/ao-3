<template lang='pug'>

.row
    .six.columns
        .section update account
        select(v-model='change.field', @change='empty')
            option(value='name') name
            option(value='secret') password
            option(value='fob') fob
        .input-container
            input.input-effect(:type='inputType' v-model='change.newfield'  :class='{"has-content":!!change.newfield}')
            label new value
            span.focus-border
        br
        .input-container(v-if='inputType === "password"   &&  change.newfield.length > 0')
            input.input-effect(:type='inputType', v-model='change.confirmNewfield'  :class='{"has-content":!!change.confirmNewfield}')
            label repeat
            span.focus-border
        .check(v-if='inputType === "password"  &&  change.confirmNewfield.length > 0')
            img.checkmark(v-if='matched', src='../assets/images/completed.svg')
            img.checkmark(v-else, src='../assets/images/uncompleted.svg')
            span - repeat correctly
        button(@click='update') update
    .six.columns
        .section preferences
        .check.click(@click='toggleTooltips')
            img.checkmark(v-if='$store.getters.member.tooltips', src='../assets/images/completed.svg')
            img.checkmark(v-else, src='../assets/images/uncompleted.svg')
            span.space tooltip
        .check.click(@click='toggleGuides')
            img.checkmark(v-if='$store.getters.member.guides'  src='../assets/images/completed.svg')
            img.checkmark(v-else, src='../assets/images/uncompleted.svg')
            span.space guide
        //- .check.click(@click='toggleMuted')
        //-     img.checkmark(v-if='!$store.getters.member.muted', src='../assets/images/completed.svg')
        //-     img.checkmark(v-else, src='../assets/images/uncompleted.svg')
        //-     span.space sound
        .check.click(@click='toggleStacks')
            img.checkmark(v-if='$store.getters.member.stacks === 5', src='../assets/images/completed.svg')
            img.checkmark(v-else, src='../assets/images/uncompleted.svg')
            span.space color

</template>
