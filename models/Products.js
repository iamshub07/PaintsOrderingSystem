const mongoose = require('mongoose')
//add brand+type
const ProductsSchema = new mongoose.Schema({
    productType: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subBrand: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    productCode: {
        type: String,
        required: true
    },
    stockCount: {
        type: Boolean,
        required: false,
        default: true
    },
    imageCode: {
        type: String,
    }
}, {
    timestamps: true,
})

ProductsSchema.index({ '$**': 'text' });


const Product = mongoose.model('Products', ProductsSchema)
module.exports = Product
