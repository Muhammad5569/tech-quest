const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique:true,
        toLowercase: true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid!')
            }
        }
    },
    role:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true,
            trim:true,
            minlength:7,
            validate(value){
                if (value.toLowerCase().includes('password')) {
                    throw new Error('Password cannot contain "password"')
                }
            }
    },
    score:{
        type:Number,
        required:true,
        default:0
    },
    solvedQuests:[{
        questId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Quest'
        },
        solvedTime:{
            type:Date,
            default:Date.now
        }
    }],
    attempts:[{
        questId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quest'
        },
        value:{
            type: String,
        }
    }],
    tokens:[
        {
            token:{
                type:String,
                required: true,
            }
        }
    ]
    
},{
    timestamps: true
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'Verification')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = user.password == password

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

const User = mongoose.model('User', userSchema)
module.exports = User