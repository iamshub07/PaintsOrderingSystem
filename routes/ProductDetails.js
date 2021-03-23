const express = require('express')
const { check, validationResult, body } = require('express-validator')
const { ValidationHalt } = require('express-validator/src/base')
const router = express.Router()
// authentication middleware
const auth = require('../middleware/auth')
// const Details = require('../models/ProductDetails')
const ProductDetails = require('../models/ProductDetails')


// get product description
router.get('/:pid', async (req, res) => {
    const product = await ProductDetails.findOne({ productCode: req.params.pid })
    if (product) {
        res.json(product)
    } else {
        res.json({ msg: "Product not found" })
    }
})

// Add product details
router.post('/add/:pid', [
    check('productCode', 'Product Code is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
], auth, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    } else {
        const product = await ProductDetails.findOne({ productCode: req.params.pid })
        if (product) {
            res.json({ msg: "Product description already exists, Try deleting the detail and add again to update" })
        } else {
            const { productCode, description, pdfname, colorcode } = req.body
            desc = new ProductDetails({
                productCode,
                description,
                pdfname,
                colorcode
            })
            await desc.save().then(() => {
                res.json({ msg: "Details Uploaded successfully" })
            })
        }
    }
    // res.json({ msg: "Adding to details" })
})

// delete a product detail
router.delete('/delete/:pid', auth, async (req, res) => {
    const item = await ProductDetails.findOneAndDelete({ productCode: req.params.pid })
    if (item) {
        res.json({ msg: "Item Deleted" })
    } else {
        res.json({ msg: "Product doesnot exist" })
    }
})

router.post('/update/:pid', auth, async (req, res) => {
    const { description, pdfname, colorcode } = req.body
    const item = await ProductDetails.findOne({ productCode: req.params.pid })
    if (item) {
        // update existing
        item.updateOne({
            description,
            pdfname,
            colorcode
        }).then(() => {
            res.json({msg:'Update Success'})
        })

    } else {
        // create new
        newItem = new ProductDetails({
            productCode:req.params.pid,
            pdfname,
            description,
            colorcode
        })
        await newItem.save().then(() => {
            res.json({ msg: 'Update Success' })
        })
    }
})



module.exports = router