const mongoose = require('mongoose')


const reviewSchema = mongoose.Schema({
    product: { type: String, required: true },
    email: { type: String, required: true },
    comment: { type: String, required: true },
    stars: { type: Number, required: true }
})

const Reviews = mongoose.model('reviews', reviewSchema)
module.exports = Reviews