const cryptoUtils = require('../crypto')
const { getResource } = require( './utils')
const events = require( './events')
const { serverState } = require( './state')
const lightning = require('./lightning')
const ChromecastAPI = require('chromecast-api')
const cast = new ChromecastAPI()

let castDeviceIds = []
let castDeviceMap = {}

cast.on('device', d => {
    let taskId = cryptoUtils.createHash(d.friendlyName)
    castDeviceIds.push(taskId)
    castDeviceMap[taskId] = d.friendlyName
})


function checkForChargedEvent( resourceId ){
    let charged
    serverState.bookings.forEach( b => {
        if (resourceId === b.resourceId) {
            let dnow = new Date()
            let now = dnow.getTime()
            let tsUntilStart = parseInt(b.startTs) - now
            let tsUntilEnd = parseInt(b.endTs) - now
            let current = (tsUntilStart < 0 && tsUntilEnd > 0)
            if (current && b.charge > 0){
                charged = b.charge
            }
        }
    })
    return charged
}

function reactions(ev){
    process.nextTick( err => {
        switch (ev.type) {
            case 'task-boosted':
            case 'task-boosted-lightning':
                let optionList = []
                let defaultPrice
                let resourceId
                let resourceList = serverState.resources.map(r => r.resourceId)
                let amount = parseFloat(ev.amount)

                serverState.tasks.some(t => {
                    if (resourceList.indexOf(t.taskId) > -1 && t.priorities.indexOf(ev.taskId) > -1){
                        resourceId = t.taskId
                        return true
                    }
                })
                if (resourceId){
                    console.log("got resourceId, attempting trigger", resourceId)
                    serverState.resources.some(r => {
                      if (r.resourceId === resourceId){
                        defaultPrice = r.charge
                        return true
                      }
                    })
                    serverState.tasks.some(t => {
                      if (ev.taskId === t.taskId){
                        let str = t.name
                        let cashTagLocation = str.search(/\$/)
                        let customPrice = parseFloat( str.slice(cashTagLocation + 1, cashTagLocation + 5) )
                        if (customPrice > 0){
                          console.log("using custom price, ", customPrice)
                          defaultPrice = customPrice
                        }
                        let hopper = t.name.split(':')[0]
                        events.resourceUsed(resourceId, 'lightning', defaultPrice, hopper, console.log)
                        return true
                      }
                    })
                }
                break
            case 'task-claimed':
                let fName = castDeviceMap[ev.inId]
                if (fName){
                    cast.devices.forEach(d => {
                        if (d.friendlyName === fName) {
                            let mediaUrl = serverState.tasks[serverState.hashMap[ev.taskId]].name
                            d.play(mediaUrl)
                        }
                    })
                }
                break
            case 'member-field-updated':
                break
            case 'member-paid':
                break
            case 'resource-stocked':
                events.memberActivated(ev.memberId)
                break
            case 'member-created':
                break
            case 'resource-created':
                break
            case 'task-created':
                break
            case 'resource-created':
                break
            case 'member-created':
                break
        }
    })
}

module.exports = reactions
