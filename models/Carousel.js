const mongoose = require('mongoose')

const carousel = mongoose.Schema({
    imageCode: {
        type: String,
        required: true,
        default: 'default.png'
    },
    description: {
        type: String,
    }
})

module.exports = Carousel = mongoose.model('carousel', carousel)