const mongoose = require('mongoose')

const ShadeSchema = mongoose.Schema({

    shadecode: {
        type: String,
        required: true
    },
    shadename: {
        type: String,
        required: true
    },
    r: {
        type: String,
        required: false
    },
    g: {
        type: String,
        required: false
    },
    b: {
        type: String,
        required: false
    },
    hexvalue: {
        type: String,
        required: false
    }
    
})
ShadeSchema.index({ '$**': 'text' });


const shadedetail = mongoose.model('shadedetail', ShadeSchema);
module.exports = shadedetail;