const express = require('express')
const Quest = require('../models/quests')
const User = require('../models/users')
const auth = require('../middleware/auth')
const {submission, pollSubmissionResult}  = require('../middleware/compiler')
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
router.get('/quests/:id', async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id)
        res.send(quest)
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

router.post('/quests/compiler/:id', auth, async (req, res) => {
    try {
        const questId = req.params.id;

        // Find the quest by ID
        const quest = await Quest.findById(questId);
        if (!quest) {
            throw new Error('Quest not found!');
        }

        // Compile the code
        const response = await submission(req.body);
        const submissionID = response.data.id;

        // Poll for the result
        const result = await pollSubmissionResult(submissionID);

        // Check if the quest is already solved
        const isSolved = req.user.solvedQuests.some((quest) => {
            return quest.questId.toString() === questId;
        });

        console.log('isSolved:', isSolved); // Debugging

        const points = quest.points;
        const isCorrect = quest.answer.trim() === result.data.trim();

        if (!isSolved) {
            // Add to solved quests
            req.user.solvedQuests.push({ questId: questId });

            // Give points to user if the answer is correct
            if (isCorrect) {
                req.user.score += points;
            } else {
                throw new Error('Answer is incorrect!');
            }
        } else {
            throw new Error('Quest already solved!');
        }

        // Save the updated user
        await req.user.save();

        // Send the updated user object as the response
        res.send(req.user);
    } catch (error) {
        console.error('Error:', error); // Log the error for debugging
        res.status(500).send({ error: error.message }); // Send a proper error response
    }
});
router.delete('/quests/delete/:id', async (req, res) => {
    try {
        await Quest.findOneAndDelete(req.params.id)
        res.json('quest deleted sucesfully')
    } catch (error) {
        res.send(error).status(500)
    }
})
router.post('/quests/reset', auth, async(req, res) => {
    try {
        req.user.score = 0
        req.user.solvedQuests = []
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.send(error).status(500)
    }
})


module.exports = router