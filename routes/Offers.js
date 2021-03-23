const { Router } = require('express')
const express = require('express')
const { check, validationResult, body } = require('express-validator')
const router = express.Router()
const auth = require('../middleware/auth')
const Products = require('../models/Products')
const Offers = require('../models/Offers')

// adding new offer
router.post('/add', auth, async (req, res) => {
    const { productCode, image, description, c_Price, d_Price } = req.body
    const offer = await Offers.findOne({ productCode })
    if (offer) {
        res.json({ msg: "Offer on this product already exist" })
        const product = await Products.findOne({ productCode: productCode })
        if (product) {

            product.updateOne({
                dealerPrice: d_Price,
                customerPrice: c_Price,
            }).then(() => {
                offer.updateOne({
                    image,
                    productCode,
                    shortDescription: description,
                    dealerPrice: d_Price,
                    customerPrice: c_Price
                }).then(() => {
                    res.json({ msg: "Offer Updated" })
                })
            })
        } else {
            res.json({ msg: 'Product not found' })
        }
    } else {
        const product = await Products.findOne({ productCode: productCode })
        if (product) {
            createOffer = new Offers({
                image,
                productCode,
                shortDescription: description,
                dealerPrice: d_Price,
                customerPrice: c_Price
            })
            product.updateOne({
                dealerPrice: d_Price,
                customerPrice: c_Price
            }).then(async () => {
                await createOffer.save().then(() => {
                    res.json({ msg: "Offer Applied" })
                })
            })
        } else {
            res.json({ msg: "Product not found" })
        }
    }
})

// get all offers
router.get('/getOffers', auth, async (req, res) => {
    const offers = await Offers.find({})
    if (offers.length == 0) {
        res.json({ msg: "No offers found" })
    } else {
        res.json(offers)
    }
})

// delete an offerI
router.delete('/deleteOffer/:id', auth, async (req, res) => {
    await Offers.findByIdAndDelete(req.params.id).then(() => {
        res.json({ msg: "Item deleted" })
    })
})

// get details of an offer
router.get('/offer/:id', auth, async (req, res) => {
    const offer = await Offers.findById(req.params.id)
    if (offer) {
        res.json(offer)
    } else {
        res.json({ msg: "Offer doesnot exist" })
    }
})

module.exports = router