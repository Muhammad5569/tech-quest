const express = require('express')
const Quest = require('../models/quests')
const User = require('../models/users')
const auth = require('../middleware/auth')
const {submission, pollSubmissionResult}  = require('../middleware/compiler')
const router = new express.Router()

//Create a new Quest
router.post('/quests', async (req, res) => {
    const quest = new Quest(req.body)
    try{
        await quest.save()
        res.status(201).send(quest)
    }catch(error){
        res.send(error).status(500)
    }
})
//Read all quests
router.get('/quests', async (req, res) => {
    try {
        const quests = await Quest.find({})
        res.send(quests)
    } catch (error) {
        res.send(error)
    }
})
//Read quest with id
router.get('/quests/:id', async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id)
        console.log('id: ', req.params.id)
        console.log('quest', quest)
        res.send(quest)
    } catch (error) {
        console.error('Error:', error); // Log the error for debugging
        res.status(500).send({ error: error.message }); // Send a proper error response
    }
})
//Change quest
router.patch('/quests/:id', async (req,res) => {
    const updates = Object.keys(req.body)
    try {
       updates.forEach(update => { req.quest[update] = req.body[update]  });
       await req.quest.save()
       res.send(req.quest)
    } catch (error) {
        res.status(500).send({ error: error.message }); // Send a proper error response
    }
})
//Compiler with 3rd party API          || api expired
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
//Delete quest
router.delete('/quests/delete/:id', async (req, res) => {
    try {
        await Quest.findOneAndDelete(req.params.id)
        res.json('quest deleted sucesfully')
    } catch (error) {
        res.send(error).status(500)
    }
})
//Reset solved quests of User
router.post('/quests/reset', auth, async(req, res) => {
    try {
        req.user.score = 0
        req.user.solvedQuests = []
        await req.user.save()
        res.json('Score Reseted to 0')
    } catch (error) {
        res.send(error).status(500)
    }
})
//Making Attempt                   
router.post('/quests/attempts/:questId', auth, async(req, res) => {
    const userId = req.user.id
    const questId = req.params.questId
    try {        
        const user = await User.findById(userId)
        const attempt = req.body.attempt
        //const attempt = JSON.parse(req.body.attempt)
        user.attempts.push({
            questId:questId,
            value: attempt
        })
        await user.save()
        console.log(attempt, 'attempt')
        res.send(user)
    } catch (error) {
        res.send({message:error.message})
    }
})
//Checking attemt           SuperADMIN
router.patch('/quests/attempts/:id', async (req, res) => {
    const userId = req.body.userId
    const questId = req.params.id;
    
    try {
      const user = await User.findById(userId);
      
      const attemptIndex = user.attempts.findIndex(attempt => 
        attempt._id.toString() === req.body.attemptId
      );
      
      if (attemptIndex === -1) {
        return res.status(404).send({ message: 'Attempt not found' });
      }
      
      // If attempt is successful, add points and mark quest as solved
      if (req.body.status === "true" || req.body.status === true) {
        user.score += 10;
        user.solvedQuests.push({ questId: questId });
      }
      
      // Remove the attempt from user's attempts array
      user.attempts.splice(attemptIndex, 1);
      
      await user.save();
      res.send(user);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });


module.exports = router


