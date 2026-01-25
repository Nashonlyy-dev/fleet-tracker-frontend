import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },

    role:{
        type: String,
        enum: ['owner','driver'],
        default: 'driver'
    },
    ownerId:{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('User', userSchema)