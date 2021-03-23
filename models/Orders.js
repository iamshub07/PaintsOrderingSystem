const mongoose = require('mongoose')

const ordersSchema = mongoose.Schema({

    user: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    paid: {
        type: Boolean,
        required: true,
        default: false
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    orderId: {
        type: String,
        require: false,
        default: "",
    },
    txnId: {
        type: String,
        require: false,
        default: "",
    },
    bankTxnId: {
        type: String,
        require: false,
        default: "",
    },
    shippingAddress: {
        type: String,
        required: false,
    },
    dispatch: {
        type: Boolean,
        default: false
    },
    deliveryBoy: {
        type: String
    },
    deliveryBoyCell: {
        type: String
    },
    cod: {
        type: Boolean
    },
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Products'
            },
            tax: {
                type: String,
                required: true,
                default: 18
            },
            productCode: {
                type: String,
                // required:true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            price: {
                type: Number,
                required: true,
                default: 0
            },
            description: {
                type: String,
                required: false,
                default: "No description"
            },
            name: {
                type: String,
                required: true,
                default: ""
            },
            image: {
                type: String,
                required: false,
            }
        }
    ],

}, {
    timestamps: true,
})

module.exports = Orders = mongoose.model('Orders', ordersSchema)
