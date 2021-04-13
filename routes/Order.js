// const { Router } = require('express')
const express = require('express');
const { check, validationResult, body } = require('express-validator')
const router = express.Router()
const auth = require('../middleware/auth')
const Products = require('../models/Products')
const shade = require('../models/Shades');
const Review = require('../models/Reviews')
// pagination
var mongoose = require('mongoose');
const ProductDetails = require('../models/ProductDetails');
const Videos = require('../models/Videos');


// @api     Get /api/Products/productType
// @desc    Fetch all productType
// @access  private
router.get('/producttype/:brand', async (req, res) => {
    try {
        const allproductType = await Products.find({ brand: req.params.brand })
        res.json(allproductType);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error! Contact Administrator");
    }
});


router.get('/brands', async (req, res) => {
    try {
        const brands = await Products.aggregate([
            { $group: { _id: { brand: "$brand" }, image: { $first: "$image" } } }
        ])
        res.send(brands);
    } catch (error) {
        console.log(error)
    }
})



// @api     Get /api/Products/brand
// @desc    Fetch all brand of req.product
// @access  private
router.get('/brand', [auth, [
    check('producttype', 'productType is required').not().isEmpty()
]], async (req, res) => {
    try {
        const query = { producttype: req.body.producttype };
        const allbrand = await Products.find().distinct('brand', query);
        res.json(allbrand);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error! Contact Administrator");
    }
});

// @api     Get /api/Products/shade
// @desc    Fetch all brand of req.product
// @access  private
router.get('/category', [
    check('producttype', 'producttype is required').not().isEmpty(),
    check('brand', 'brand is required').not().isEmpty()
], auth, async (req, res) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() })
    } else {
        try {
            const query = { brand: req.body.brand, producttype: req.body.producttype };
            const allcategory = await Products.find().distinct('category', query);
            res.json(allcategory);
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Server Error! Contact Administrator");
        }
    }
});


// @api     Get /api/Products/subBrand
// @desc    Fetch all subBrand of req.product
// @access  private
router.get('/subBrand', [
    check('brand', 'brand is required').not().isEmpty(),
    check('producttype', 'producttype is required').not().isEmpty(),
    check('category', 'category is required').not().isEmpty()
], async (req, res) => {
    try {
        const allcategory = await Products.find({ brand: req.body.brand, producttype: req.body.producttype, category: req.body.category });
        res.json(allcategory);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error! Contact Administrator");
    }
});


// @api     Get /api/Products/shade
// @desc    Fetch all subBrand of req.product
// @access  private
router.get('/shade/:limit/:page', async (req, res) => {
    const counts = await shade.countDocuments().exec();
    const pages = req.params.page;
    const limits = req.params.limit;
    const start = (Math.ceil(pages - 1) * limits);
    const end = pages * limits;
    if (pages > (counts / limits) + 1) {
        res.json({ msg: "End Reached" })
    } else {
        try {
            const allshades = await shade.find({})
            if (allshades) {
                res.json(allshades.slice(start, end))
            }
        } catch (error) {
            console.log(error)
            res.status(500).send("Server Error! Contact Administrator");
        }
    }
});


router.get('/shade/:shadecode', async (req, res) => {
    const filteredShade = await shade.find({ "shadecode": { $regex: ".*" + req.params.shadecode + "*.", '$options': 'i' } })
    if (filteredShade.length !== 0) {
        res.json(filteredShade)
    } else {
        const filteredShade = await shade.find({ "shadename": { $regex: ".*" + req.params.shadecode + "*.", '$options': 'i' } })
        if (filteredShade.length !== 0) {
            res.json(filteredShade)
        } else {
            res.json({ msg: "EMPTY" })
        }
    }
})

// @api     Get /api/Order/Product
// @desc    Fetch all Product of req.product
// @access  private
router.get('/Product', [
    check('productcode', 'productcode is required').not().isEmpty()
], async (req, res) => {
    try {
        if (req.body.shadecode) {
            const allproduct = await ProductDetails.find({ productcode: req.body.productcode, shadecode: req.body.shadecode });
            res.json(allproduct);
        }
        if (!req.body.shadecode) {
            const allproduct = await ProductDetails.find({ productcode: req.body.productcode });
            res.json(allproduct);
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error! Contact Administrator");
    }
});

// /////////////////////////-------------- Video Links ---------------------------/////////////////////////
router.get('/videos', async (req, res) => {
    const videos = await Videos.find({});
    if (videos.length != 0) {
        res.status(200).json(videos);
    } else {
        res.status(404).json({ msg: "No videos found" })
    }
})

router.post('/videos', auth, async (req, res) => {
    const { title, description, link } = req.body
    const videos = await Videos.findOne({ 'link': link })
    if (videos) {
        res.status(500).json({ msg: "A video with this link already present" })
    } else {
        newVideo = new Videos({
            title,
            description,
            link
        })
        await newVideo.save().then(() => {
            res.status(201).json({ "msg": "Video added" })
        })
    }
})

router.delete('/videos/:id', auth, async (req, res) => {
    const video = await Videos.findByIdAndDelete(req.params.id)
    if (video) {
        res.status(200).json({ "msg": "Video deleted" })
    } else {
        res.status(503).json({ "msg": "Bad request video not deleted" })
    }
})

module.exports = router;