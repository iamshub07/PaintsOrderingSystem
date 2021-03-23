const mongoose = require('mongoose')

const ShadeSchema = mongoose.Schema({

    shadecode: {
        type: String,
        required: true
    },
    hexvalue: {
        type: String,
        required: true
    },
    shadecolor: {
        type: String,
        required: true
    }
})
ShadeSchema.index({ '$**': 'text' });


const shadedetail = mongoose.model('ProductDetails', ShadeSchema);
module.exports = shadedetail;