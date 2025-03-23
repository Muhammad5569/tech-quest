require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const userRouter = require('./routers/users')
const questRouter = require('./routers/quests')

mongoose.connect('mongodb://127.0.0.1:27017')

const port = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use(userRouter)
app.use(questRouter)

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });



app.listen(port, ()=> console.log(`Server is up on post: ${port}`))