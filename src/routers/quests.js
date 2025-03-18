const express = require('express')
const Quest = require('../models/quests')

const router = new express.Router()

router.post('/quests', async (req, res) => {
    const quest = new Quest(req.body)
    try{
        await quest.save()
        res.status(201).send(quest)
    }catch(error){
        res.send(error).status(500)
    }
})
router.get('/quests', async (req, res) => {
    try {
        const quests = await Quest.find({})
        res.send(quests)
    } catch (error) {
        res.send(error)
    }
})
router.patch('/quests/:id', async (req,res) => {
    const updates = Object.keys(req.body)
    try {
       updates.forEach(update => { req.quest[update] = req.body[update]  });
    } catch (error) {
        res.status(400).send(error)
    }
})


module.exports = router