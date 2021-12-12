const uuidV1 = require('uuid/v1')
const _ = require('lodash')
const crypto = require('crypto')

const { serverState } = require('./state')
const dctrlDb = require('./dctrlDb')

function taskColored(taskId, inId, color, blame, callback){
    let newEvent = {
        type: "task-colored",
        taskId,
        inId,
        color,
        blame,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskSeized(taskId, inId, callback){
  let newEvent = {
      type: "task-seized",
      taskId,
      inId,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskTouched(taskId, stack, position, memberId, callback){
    let newEvent = {
        type: "task-touched",
        taskId,
        stack,
        position,
        memberId,
    }
    dctrlDb.insertEvent(newEvent, callback)
}


function taskCompleted(taskId, inId, blame, callback){
    let newEvent = {
      type: "task-completed",
      taskId,
      inId,
      blame,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskValued(taskId, value, blame, callback) {
  let newEvent = {
    type: "task-valued",
    taskId,
    value,
    blame
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function highlighted(taskId, memberId, valence, blame, callback){
    let newEvent = {
        type: "highlighted",
        taskId,
        memberId,
        valence,
        blame,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function aoInboundConnected(address, secret, callback){
    let newEvent = {
        type: "ao-inbound-connected",
        address,
        secret,
        i: serverState.tasks.length,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function aoOutboundConnected(address, secret, callback) {
    let newEvent = {
        type: "ao-outbound-connected",
        address,
        secret,
        i: serverState.tasks.length,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function aoDisconnected(address, callback) {
    let newEvent = {
        type: "ao-disconnected",
        address,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function aoNamed(alias, callback){
    let newEvent = {
        type: "ao-named",
        alias,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function getNodeInfo(info, callback){
    let newEvent = {
        type: "get-node-info",
        info
    }
    dctrlDb.triggerShadow(newEvent)
}

function rentSet(amount, callback){
    let newEvent = {
      type: "rent-set",
      amount
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function capSet(amount, callback){
    let newEvent = {
      type: "cap-set",
      amount
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function spotUpdated(spot, callback) {
  let newEvent = {
      type: "spot-updated",
      spot
  }
  dctrlDb.triggerShadow(newEvent)
}

function currencySwitched(currency, callback) {
  let newEvent = {
      type: "currency-switched",
      currency
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function memberCreated(name, fob, secret, callback) {
      let memberId = uuidV1()
      let newEvent = {
          type: "member-created",
          memberId,
          name,
          fob,
          secret,
          i: serverState.tasks.length
      }
      dctrlDb.insertEvent(newEvent, callback)
}

function memberDeactivated(memberId, callback) {
  let newEvent = {
    type: "member-deactivated",
    memberId,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function memberPurged(memberId, blame, callback) {
  let newEvent = {
    type: "member-purged",
    memberId,
    blame,
    i: serverState.hashMap[memberId]
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function memberActivated(memberId, callback) {
  let newEvent = {
    type: "member-activated",
    memberId,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function memberFieldUpdated(memberId, field, newfield, callback){
  let newEvent = {
    type: "member-field-updated",
    memberId,
    field,
    newfield,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function resourceCreated(resourceId, name, charged, secret, trackStock, callback) {
    let newEvent = {
        type: "resource-created",
        resourceId,
        name,
        charged,
        secret,
        info: {},
        i: serverState.tasks.length
    }
    if (trackStock) {
        newEvent.stock = 0
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function resourceStocked(resourceId, memberId, amount, paid, notes, callback) {
  let newEvent = {
      type: 'resource-stocked',
      resourceId,
      memberId,
      amount,
      paid,
      notes,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function resourceUsed(resourceId, memberId, charged, notes, callback) {
  let newEvent = {
      type: 'resource-used',
      resourceId,
      memberId,
      charged,
      notes
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function resourceBooked(resourceId, memberId, startTs, endTs, eventType, charge, notes, callback) {
  let newEvent = {
      type: 'resource-booked',
      resourceId,
      memberId,
      startTs,
      endTs,
      eventType,
      charge,
      notes,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function bookCancelled(resourceId, bookTime, callback){
  let newEvent = {
      type: 'book-cancelled',
      resourceId,
      bookTime,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function resourcePurged(resourceId, blame, callback) {
  let newEvent = {
    type: "resource-purged",
    resourceId,
    blame,
    i: serverState.hashMap[resourceId]
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function sessionCreated(ownerId, session, token, callback) {
    let newEvent = {
        type: "session-created",
        session,
        token,
        ownerId
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function sessionKilled(session, callback) {
    let newEvent = {
        type: "session-killed",
        session
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskCreated(name, color, deck, inId, memberId, callback) {
    let h = crypto.createHash('sha256')
    h.update(name)
    let hash = h.digest('hex')
    let isExist = false
    serverState.tasks.forEach( t => {
        if (t.taskId === hash || t.hash === hash){
            isExist = true
        }
    })
    if (isExist) return callback('err exists')

    let newEvent = {
        type: "task-created",
        taskId: hash,
        name,
        color,
        deck,
        inId,
        memberId,
        i: serverState.tasks.length
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function addressUpdated(taskId, btcAddr, blame, callback){
      dctrlDb.insertEvent({
          type: "address-updated",
          taskId,
          btcAddr,
          blame,
      }, callback)
}

function taskGuilded(taskId, guild, blame, callback){
    let newEvent = {
        type: "task-guilded",
        taskId,
        guild,
        blame,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskSubTasked(taskId, inId, blame, callback){
    let newEvent = {
      type: "task-sub-tasked",
      taskId,
      inId,
      blame,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskDeSubTasked(taskId, inId, blame, callback){
    let newEvent = {
      type: "task-de-sub-tasked",
      taskId,
      inId,
      blame,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function pileSubTasked(inId, tasks, blame, callback){
    let newEvent = {
      type: "pile-sub-tasked",
      inId,
      tasks,
      blame,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function pileDeSubTasked(inId, tasks, blame, callback){
    let newEvent = {
      type: "pile-de-sub-tasked",
      inId,
      tasks,
      blame,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskPrioritized(taskId, inId, fromId, blame, callback){
    let newEvent = {
      type: "task-prioritized",
      taskId,
      inId,
      fromId,
      blame,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function pilePrioritized(inId, tasks, blame, callback) {
  let newEvent = {
    type: "pile-prioritized",
    inId,
    tasks,
    blame,
  };
  dctrlDb.insertEvent(newEvent, callback);
}

function taskPopped(taskId, inId, blame, callback){
    let newEvent = {
      type: "task-popped",
      taskId,
      inId,
      blame
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskGrabbed(taskId, memberId, callback){
    let newEvent = {
      type: "task-grabbed",
      taskId,
      memberId,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskDropped(taskId, memberId, callback){
    let newEvent = {
      type: "task-dropped",
      taskId,
      memberId,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function taskClaimed(taskId, memberId, inId, callback) {
  let newEvent = {
    type: "task-claimed",
    taskId,
    memberId,
    inId,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskUnclaimed(taskId, memberId, inId, callback) {
  let newEvent = {
    type: "task-unclaimed",
    taskId,
    memberId,
    inId,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskBoosted(taskId, amount, txid, callback) {
  let newEvent = {
      type: "task-boosted",
      taskId,
      amount,
      txid,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskBoostedLightning(taskId, amount, payment_hash, pay_index, callback) {
  let newEvent = {
      type: "task-boosted-lightning",
      taskId,
      amount,
      payment_hash,
      pay_index,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskRemoved(taskId, blame, callback){
  let newEvent = {
    type: "task-removed",
    taskId,
    blame,
    i: serverState.hashMap[taskId]
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function taskSwapped(taskId, swapId1, swapId2, blame, callback){
  let newEvent = {
    type: "task-swapped",
    taskId,
    swapId1,
    swapId2,
    blame,
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function tasksReceived(tasks, blame, callback) {
  let newEvent = {
    type: "tasks-received",
    tasks,
    blame,
    i: serverState.tasks.length
  }
  dctrlDb.insertEvent(newEvent, callback)
}

function invoiceCreated(taskId, bolt11, payment_hash, blame, callback){
    let newEvent = {
        type: "invoice-created",
        taskId,
        bolt11,
        payment_hash,
        blame,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

function memberCharged(memberId, charged, notes, callback) {
    let newEvent = {
        type: "member-charged",
        memberId,
        charged,
        notes,
    }
    dctrlDb.insertEvent(newEvent, callback)
}

module.exports = {
    highlighted,
    memberCharged,
    aoOutboundConnected,
    aoDisconnected,
    aoNamed,
    aoInboundConnected,
    spotUpdated,
    rentSet,
    capSet,
    getNodeInfo,
    memberCreated,
    memberDeactivated,
    memberPurged,
    memberActivated,
    memberFieldUpdated,
    resourceCreated,
    resourceUsed,
    resourceStocked,
    resourceBooked,
    bookCancelled,
    resourcePurged,
    sessionCreated,
    sessionKilled,
    taskCreated,
    taskBoosted,
    taskClaimed,
    taskUnclaimed,
    taskRemoved,
    taskSwapped,
    taskGrabbed,
    taskPrioritized,
    taskPopped,
    taskDropped,
    taskGuilded,
    taskSubTasked,
    taskDeSubTasked,
    addressUpdated,
    invoiceCreated,
    taskBoostedLightning,
    tasksReceived,
    pilePrioritized,
    pileSubTasked,
    pileDeSubTasked,
    taskValued,
    taskCompleted,
    taskTouched,
    taskSeized,
    taskColored,
}
