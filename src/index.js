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

app.listen(port, ()=> console.log(`Server is up on post: ${port}`))