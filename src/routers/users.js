const express = require('express')
const User = require('../models/users')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/users', async (req, res) => {
    
    try {
        const user = await User.create(req.body)
        const token = await user.generateAuthToken()
        res.cookie('userType', user.role,{
            httpOnly: true,
            secure: true,
            sameSite: 'none',
          } )
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 3600000 // 1 hour
          });
        res.status(201).send(user)
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({error:'Email already exists'})
        }
        res.status(500).send(error)
    }
})
router.get('/usersinfo', async (req, res) => {
    try {
        const users = await User.find()
        res.send(users)
    } catch (error) {
        res.status(500).send(error)
    }
})
router.get('/user', async (req, res) => {
    try{
        const user = await User.findOne({_id:req.params.id})
        res.send(user)
    }catch(error){
        res.status(500).send(error)
    }
})
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.cookie('userType', user.role,{
            httpOnly: true,
            secure: true,
            sameSite: 'none',
          } )
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 3600000 // 1 hour
          });
        res.send(user)
    } catch (error) {
        res.status(401).send({ 
            error: error.message || 'Login failed' 
        });
    }   
})
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
router.post('users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.send()
    }
})
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }
    
    try {
      // Apply each update to the user object
      updates.forEach((update) => {
        req.user[update] = req.body[update];
      });
      
      // Save 
      await req.user.save();
    
      res.send(req.user);
    } catch (error) {
      res.status(400).send(error);
    }
  });
router.delete('/users/:id', async (req, res) => {
    try {
        await User.deleteOne({_id:req.params.id})
        res.send('deleted')  
    } catch (error) {
        res.send(error)
    }
})

module.exports = router
