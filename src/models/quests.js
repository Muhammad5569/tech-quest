const mongoose = require('mongoose')

const questSchema = mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    category:{
        type: String,
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
    yourTask: {
        type:String,
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
    },
    learningOutcome:{
        type: String,
    }
},{
    timestamps: true
})



const Quest = mongoose.model('Quest', questSchema)
module.exports = Quest