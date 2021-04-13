const mongoose = require('mongoose')

const videos = mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'default.png'
    },
    description: {
        type: String,
    },
    link: {
        type: String,
        required: true
    }
})

module.exports = Videos = mongoose.model('videos', videos)