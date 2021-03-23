const mongoose = require('mongoose')


const ProductDetailSchema = new mongoose.Schema({
    productCode: {
        type: String,
        required: true
    },
    shadecode: {
        type: String,
        required: false
    },
    shadename: {
        type: String,
        required: false
    },
    customerprice: {
        type: String,
        require: true

    },
    dealerprice: {
        type: String,
        require: false

    },
    description: {
        type: String,
        require: false
    },
    pdfname: {
        type: String,
        required: false,
    },
    colorcode: {
        type: String,
        required: false
    }
})
ProductDetailSchema.index({ '$**': 'text' });


const ProductDetails = mongoose.model('ProductDetails', ProductDetailSchema);
module.exports = ProductDetails;