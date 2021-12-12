const express = require( 'express')
const uuidV1 = require( 'uuid/v1')
const state = require( './state')
const utils = require( './utils')
const validators = require( './validators')
const calculations = require( '../calculations')
const events = require( './events')
const connector = require( './connector')
const lightning = require( './lightning')
const router = express.Router()
const chalk = require('chalk')

router.post('/events', (req, res, next) => {
    state.serverState.sessions.forEach(s => {
        if (s.token === req.headers.authorization){
            req.body.blame = s.ownerId
        }
    })
    next()
})

const fs = require('fs')
const crypto = require('crypto')
const con = require('../../configuration')
const priv = fs.readFileSync(con.privateKey)

router.post('/events', (req, res, next)=>{
  let errRes = []
  switch (req.body.type){
      case "member-purged":
          if (
            validators.isMemberId(req.body.memberId, errRes)
          ) {
            events.memberPurged(
              req.body.memberId,
              req.body.blame,
              utils.buildResCallback(res)
            )
          } else {
            res.status(400).send(errRes);
          }
          break
      case "task-colored":
          if (
            validators.isTaskId(req.body.taskId, errRes) &&
            validators.isTaskId(req.body.inId, errRes) &&
            validators.isNotes(req.body.color, errRes)
          ) {
            events.taskColored(
              req.body.taskId,
              req.body.inId,
              req.body.color,
              req.body.blame,
              utils.buildResCallback(res)
            )
          } else {
            res.status(400).send(errRes);
          }
          break
      case "task-locked":
          state.serverState.members.some( m => {
              if (m.memberId === req.body.blame){
                  console.log(chalk.bold( crypto.privateDecrypt(priv, Buffer.from(req.body.name, 'hex') ).toString('latin1')))
                  console.log( chalk.bold.magenta('-', m.name))
                  events.taskCreated(
                    "__lock:" + req.body.name,
                    req.body.color,
                    req.body.deck,
                    req.body.inId,
                    req.body.blame,
                    utils.buildResCallback(res)
                  )
              }
          })
          break
      case "address-updated":
          if (validators.isTaskId(req.body.taskId, errRes)){
              lightning.newAddress()
                  .then(result => {
                      events.addressUpdated(
                        req.body.taskId,
                        result['bech32'],
                        req.body.blame,
                        utils.buildResCallback(res)
                      )
                  })
              .catch(console.log)
          }
          break
      case "task-seized":
          if (
            validators.isTaskId(req.body.taskId, errRes) &&
            validators.isTaskId(req.body.inId, errRes)
          ) {
            events.taskSeized(
                req.body.taskId,
                req.body.inId,
                utils.buildResCallback(res)
            );
          } else {
            res.status(400).send(errRes);
          }
          break
      case "task-touched":
          if (
            validators.isTaskId(req.body.taskId, errRes) &&
            validators.isNotes(req.body.stack, errRes)  &&
            validators.isNotes(req.body.position, errRes) &&
            validators.isNotes(req.body.value, errRes)
          ) {
            events.taskTouched(
              req.body.taskId,
              req.body.stack,
              req.body.position,
              req.body.blame,
              utils.buildResCallback(res)
            );
          } else {
            res.status(400).send(errRes);
          }
          break
      case "task-valued":
        if (
          validators.isTaskId(req.body.taskId, errRes) &&
          validators.isAmount(req.body.value, errRes)
        ) {
          events.taskValued(
            req.body.taskId,
            req.body.value,
            req.body.blame,
            utils.buildResCallback(res)
          );
          lightning
              .createInvoice(req.body.value, "<3" +  uuidV1(), '~ ao ~', 3600)
              .then(result => {
                  let addr = result['p2sh-segwit']
                  events.invoiceCreated(req.body.taskId, result.bolt11, result.payment_hash, req.body.blame)
              })
              .catch(err => {
                  console.log(err)
              });
        } else {
          res.status(400).send(errRes);
        }
        break
      case "task-popped":
          if (
            validators.isTaskId(req.body.taskId, errRes) &&
            validators.isTaskId(req.body.inId, errRes)
          ) {
            events.taskPopped(
              req.body.taskId,
              req.body.inId,
              req.body.blame,
              utils.buildResCallback(res)
            );
          } else {
            res.status(400).send(errRes);
          }
          break
      case "pile-prioritized":
          if (
              validators.isTaskId(req.body.inId, errRes) &&
              req.body.tasks.every(tId => validators.isTaskId(tId, errRes))
          ) {
              events.pilePrioritized(req.body.inId, req.body.tasks, req.body.blame, utils.buildResCallback(res));
          } else {
              res.status(400).send(errRes);
          }
          break
      case "pile-sub-tasked":
          if (
              validators.isTaskId(req.body.inId, errRes) &&
              req.body.tasks.every(tId => validators.isTaskId(tId, errRes))
          ) {
              events.pileSubTasked(req.body.inId, req.body.tasks, req.body.blame, utils.buildResCallback(res));
          } else {
              res.status(400).send(errRes);
          }
          break
      case "pile-de-sub-tasked":
          if (
              validators.isTaskId(req.body.inId, errRes) &&
              req.body.tasks.every(tId => validators.isTaskId(tId, errRes))
          ) {
              events.pileDeSubTasked(req.body.inId, req.body.tasks, req.body.blame, utils.buildResCallback(res));
          } else {
              res.status(400).send(errRes);
          }
          break
      case 'highlighted':
          if (
              validators.isTaskId(req.body.taskId, errRes) &&
              validators.isMemberId(req.body.memberId, errRes) &&
              validators.isBool(req.body.valence, errRes)
          ){
              events.highlighted(req.body.taskId, req.body.memberId, req.body.valence, req.body.blame, utils.buildResCallback(res))
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'ao-disconnected':
          if (validators.isAddress(req.body.address, errRes)){
              events.aoDisconnected(
                req.body.address,
                utils.buildResCallback(res)
              )
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'ao-named':
          if (validators.isNotes(req.body.alias, errRes)){
              events.aoNamed(req.body.alias, utils.buildResCallback(res))
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'rent-set':
          if (
              validators.isAmount(req.body.amount, errRes)
          ){
              events.rentSet(
                req.body.amount,
                utils.buildResCallback(res)
              )
          } else {
              res.status(400).send(errRes)
          }memberCreated
          break
      case 'cap-set':
          if (
              validators.isAmount(req.body.amount, errRes)
          ){
              events.capSet(
                req.body.amount,
                utils.buildResCallback(res)
              )
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'ao-outbound-connected':
          console.log('connecting outbound')
          connector.postEvent(req.body.address, req.body.secret, {
              type: 'ao-inbound-connected',
              address: state.serverState.cash.address,
              secret: req.body.secret, //
          }, (err, subscriptionResponse) => {
              console.log('got response from other ao:', {err, subscriptionResponse})
              if (err || !subscriptionResponse  || !subscriptionResponse.result.lastInsertRowid){
                  return res.status(200).send(['ao-connect failed'])
              }
              console.log('subscribe success, attempt ao connect')
              events.aoOutboundConnected(
                req.body.address,
                req.body.secret,
                utils.buildResCallback(res)
              )
          })
          break
      case 'ao-inbound-connected':
          console.log('ao-inbound-connected attempted')
          if (
              validators.isNotes(req.body.address, errRes) &&
              validators.isNotes(req.body.secret, errRes)
          ){
              events.aoInboundConnected(
                req.body.address,
                req.body.secret,
                utils.buildResCallback(res)
              )
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'ao-relay':
          let secret
          state.serverState.ao.forEach(a => {
              if (a.address == req.body.address){
                  secret = a.outboundSecret
              }
          })
          if (secret){
              connector.postEvent(req.body.address, secret, req.body.ev, (connectorRes) => {
                  console.log("ao relay response", {connectorRes})
              })
          } else {
              console.log("no connection for ", req.body.address)
              next()
          }
          break
      case 'invoice-created':
          if (
              validators.isTaskId(req.body.taskId, errRes) &&
              validators.isAmount(req.body.amount, errRes)
          ) {
              lightning.createInvoice(req.body.amount, "<3" +  uuidV1(), '~', 3600)
                  .then(result => {
                      events.invoiceCreated(req.body.taskId, result.bolt11, result.payment_hash, req.body.blame, utils.buildResCallback(res))
                  })
                  .catch(err => {
                      console.log({err})
                      res.status(200).send("attempt failed")
                  });
          } else {
            res.status(400).send(errRes)
          }
          break
      case 'member-created':
          if (
              validators.isValidName(req.body.name, errRes) &&
              validators.isNotes(req.body.fob, errRes) &&
              validators.isNotes(req.body.secret)
          ){
            events.memberCreated(
              req.body.name,
              req.body.fob,
              req.body.secret,
              utils.buildResCallback(res)
            )
          } else {
            res.status(400).send(errRes)
          }
          break
      case 'member-activated':
          if (
            validators.isMemberId(req.body.memberId, errRes)
          ){
            events.memberActivated(
              req.body.memberId,
              utils.buildResCallback(res)
            )
          } else {
            res.status(400).send(errRes)
          }
          break
      case 'member-deactivated':
          if (
            validators.isMemberId(req.body.memberId, errRes)
          ){
            events.memberDeactivated(
              req.body.memberId,
              utils.buildResCallback(res)
            )
          } else {
            res.status(400).send(errRes)
          }
          break
      case 'member-field-updated':
          if (
              validators.isMemberId(req.body.memberId, errRes) &&
              validators.isField(req.body.field, errRes) &&
              validators.isNotes(req.body.newfield, errRes)
          ){
              events.memberFieldUpdated(
                  req.body.memberId,
                  req.body.field,
                  req.body.newfield,
                  utils.buildResCallback(res)
              )
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'resource-created':
          console.log('trying',req.body.resourceId,req.body.name,req.body.charged,req.body.secret,req.body.trackStock)
          if (
            validators.isNewResourceId(req.body.resourceId, errRes) &&
            validators.isNotes(req.body.name, errRes) &&
            validators.isAmount(req.body.charged, errRes) &&
            validators.isNotes(req.body.secret, errRes) &&
            validators.isBool(req.body.trackStock, errRes)
          ){
            events.resourceCreated(
              req.body.resourceId,
              req.body.name,
              req.body.charged,
              req.body.secret,
              req.body.trackStock,
              utils.buildResCallback(res)
            )
          } else {
            console.log(errRes)
            res.status(400).send(errRes)
          }
          break
      case 'resource-used':
          let member = validators.isActiveMemberId(req.body.memberId, errRes)
          let resource = validators.isResourceId(req.body.resourceId, errRes)
          let memberTask = validators.isTaskId(member.memberId, errRes)
          let canAccess = calculations.access(member.active, memberTask.boost, resource.charged)
          if (
              member &&
              resource &&
              validators.isAmount(req.body.charged, errRes) &&
              validators.isNotes(req.body.notes, errRes) &&
              canAccess
          ){
              events.resourceUsed(
                req.body.resourceId,
                req.body.memberId,
                req.body.charged,
                req.body.notes,
                utils.buildResCallback(res)
              )
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'resource-stocked':
          if (
            validators.isResourceId(req.body.resourceId, errRes) &&
            validators.isMemberId(req.body.memberId, errRes) &&
            validators.isAmount(req.body.amount, errRes) &&
            validators.isAmount(req.body.paid, errRes) &&
            validators.isNotes(req.body.notes, errRes)
          ){
            events.resourceStocked(
                req.body.resourceId,
                req.body.memberId,
                req.body.amount,
                req.body.paid,
                req.body.notes,
                utils.buildResCallback(res)
            )
          } else {
            res.status(400).send(errRes)
          }
          break
      case 'resource-booked':
          if (
            validators.isTaskId(req.body.resourceId, errRes) &&
            validators.isMemberId(req.body.blame, errRes) &&
            validators.isNotes(req.body.startTs, errRes) &&
            validators.isNotes(req.body.endTs, errRes) &&
            validators.isNotes(req.body.eventType, errRes) &&
            validators.isNotes(req.body.charge, errRes) &&
            validators.isNotes(req.body.notes, errRes)
          ){
            events.resourceBooked(
              req.body.resourceId,
              req.body.blame,
              req.body.startTs,
              req.body.endTs,
              req.body.eventType,
              req.body.charge,
              req.body.notes,
              utils.buildResCallback(res)
            )
          } else {
            res.status(400).send(errRes)
          }
          break
      case 'session-killed':
          if (
            validators.isSession(req.body.session, errRes)
          ){
            events.sessionKilled(
              req.body.session,
              utils.buildResCallback(res)
            )
          } else {
            res.status(400).send(errRes)
          }
          break
      case 'task-created':
          if (
            validators.isNotes(req.body.name, errRes) &&
            validators.isNotes(req.body.color, errRes) &&
            validators.isNotes(req.body.deck, errRes) &&
            validators.isTaskId(req.body.inId, errRes)
          ){
              events.taskCreated(
                  req.body.name,
                  req.body.color,
                  req.body.deck,
                  req.body.inId,
                  req.body.blame,
                  utils.buildResCallback(res)
              )
          } else {
            res.status(400).send(errRes)
          }
          break
      case 'task-guilded':
          if (
              validators.isTaskId(req.body.taskId, errRes) // &&
              // validators.isNotes(req.body.guild, errRes) // fix the validator break the app
          ){
              events.taskGuilded(
                req.body.taskId,
                req.body.guild,
                req.body.blame,
                utils.buildResCallback(res)
              )
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'task-sub-tasked':
          if (
            validators.isTaskId(req.body.taskId, errRes) &&
            validators.isTaskId(req.body.inId, errRes)
          ){
            events.taskSubTasked(
              req.body.taskId,
              req.body.inId,
              req.body.blame,
              utils.buildResCallback(res)
            )


          } else {
            res.status(400).send(errRes)
          }
          break
      case 'task-de-sub-tasked':
          if (
            validators.isTaskId(req.body.taskId, errRes) &&
            validators.isTaskId(req.body.inId, errRes)
          ){
            events.taskDeSubTasked(
              req.body.taskId,
              req.body.inId,
              req.body.blame,
              utils.buildResCallback(res)
            )
          } else {
            res.status(400).send(errRes)
          }
          break
      case 'task-claimed':
          if (
            validators.isTaskId(req.body.taskId, errRes) &&
            validators.isTaskId(req.body.inId, errRes)
          ){
            events.taskClaimed(
              req.body.taskId,
              req.body.blame,
              req.body.inId,
              utils.buildResCallback(res)
            )
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'task-unclaimed':
          if (
            validators.isTaskId(req.body.taskId, errRes) &&
            validators.isTaskId(req.body.inId, errRes)
          ){
            events.taskUnclaimed(
              req.body.taskId,
              req.body.blame,
              req.body.inId,
              utils.buildResCallback(res)
            )
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'task-removed':
          if (
              validators.isMemberId(req.body.taskId, errRes)
          ){
              events.memberPurged(
                req.body.taskId,
                req.body.blame,
                utils.buildResCallback(res)
              )
          } else if (
              validators.isResourceId(req.body.resourceId, errRes)
          ){
              events.resourcePurged(
                req.body.resourceId,
                req.body.blame,
                utils.buildResCallback(res)
              )
          } else if (
              validators.isTaskId(req.body.taskId, errRes)
          ){
              events.taskRemoved(
                req.body.taskId,
                req.body.blame,
                utils.buildResCallback(res)
              )
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'task-grabbed':
          if (
              validators.isTaskId(req.body.taskId, errRes)
          ){
              events.taskGrabbed(
                req.body.taskId,
                req.body.blame,
                utils.buildResCallback(res)
              )
          } else {
            res.status(400).send(errRes)
          }
          break
      case 'task-dropped':
          if (
              validators.isTaskId(req.body.taskId, errRes)
          ){
              events.taskDropped(
                  req.body.taskId,
                  req.body.blame,
                  utils.buildResCallback(res)
              )
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'task-swapped':
          if (
              validators.isTaskId(req.body.taskId, errRes) &&
              validators.isTaskId(req.body.swapId1, errRes) &&
              validators.isTaskId(req.body.swapId2, errRes)
          ) {
              events.taskSwapped(
                req.body.taskId,
                req.body.swapId1,
                req.body.swapId2,
                req.body.blame,
                utils.buildResCallback(res)
              )
          } else {
            res.status(400).send(errRes)
          }
          break
      case 'task-prioritized':
          if (
              validators.isTaskId(req.body.inId, errRes) &&
              validators.isTaskId(req.body.fromId, errRes) &&
              validators.isTaskId(req.body.taskId, errRes)
          ){
              events.taskPrioritized(
                req.body.taskId,
                req.body.inId,
                req.body.fromId,
                req.body.blame,
                utils.buildResCallback(res)
              )
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'task-completed':
          if (
              validators.isTaskId(req.body.inId, errRes) &&
              validators.isTaskId(req.body.taskId, errRes)
          ){
              events.taskCompleted(
                req.body.taskId,
                req.body.inId,
                req.body.blame,
                utils.buildResCallback(res)
              )
          } else {
              res.status(400).send(errRes)
          }
          break
      case 'tasks-received':
          if (true) { // XXX
              events.tasksReceived(
                req.body.tasks,
                req.body.blame,
                utils.buildResCallback(res))
          } else {
            res.status(400).send(errRes)
          }
          break
      default:
          next()
    }
})

module.exports = router
