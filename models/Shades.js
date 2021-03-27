const mongoose = require('mongoose')

const ShadeSchema = mongoose.Schema({

    shadecode: {
        // Shade name
        type: String,
        required: true
    },
    hexvalue: {
        // Hex code
        type: String,

    },
    r: {
        type: String,

    },
    g: {
        type: String,

    },
    b: {
        type: String,

    },
    shadename: {
        type: String,
    }
})
ShadeSchema.index({ '$**': 'text' });


const shadedetail = mongoose.model('ProductDetails', ShadeSchema);
module.exports = shadedetail;