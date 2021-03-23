const { Mongoose } = require("mongoose")

const mongoose = require('mongoose')

const userSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    isActive: {
        type: Boolean,
        require: true,
        default:true
    },
    gst: {
        type: String,
        required: false,
    },
    isCustomer: {
        type: Boolean,
        require: true,
        default:true
    },
    avatar: {
        type: String,
    },
    otp: {
        type: Number,
        required: false
    }

}, {
    timestamps: true,
})

const User = mongoose.model('Users', userSchema)
module.exports = User