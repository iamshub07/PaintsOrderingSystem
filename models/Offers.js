const mongoose = require('mongoose')

const offers = mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    productCode: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String,
        require: true,
    },
    dealerPrice: {
        type: String,
    },
    customerPrice: {
        type: String
    }
})

module.exports = Offers = mongoose.model('offers', offers)