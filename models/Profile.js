const mongoose = require('mongoose')

const profileSchema = mongoose.Schema({

    user: {
        type: String,
        ref: 'required'
    },
    address: [
        {
            flat: {
                type: String,
                required: true,
            },
            street: {
                type: String,
                required: true
            },
            pincode: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true,
                default: 'Maharashtra'
            },
            country: {
                type: String,
                required: true,
                default: 'India'
            },
            poc: {
                type: Number,
            },
            pocName: {
                type: String
            }
        }
    ]
})

const Profile = mongoose.model('Profile', profileSchema)
module.exports = Profile