const mongoose = require('mongoose')

const questSchema = mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    scenario:{
        type: String,
        required: true,
    },
    defaultCode: {
        type: String,
    },
    points: {
        type: Number
    },
    answer: {
        type: String,
        required: true,
    },
    solution: {
        type: String,
    }
})



const Quest = mongoose.model('Quest', questSchema)
module.exports = Quest