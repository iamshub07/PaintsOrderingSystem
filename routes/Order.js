// const { Router } = require('express')
const express = require('express');
const { check, validationResult, body } = require('express-validator')
const router = express.Router()
const auth = require('../middleware/auth')
const Products = require('../models/Products')
const Review = require('../models/Reviews')
// pagination
var mongoose = require('mongoose');
const ProductDetails = require('../models/ProductDetails')


// @api     Get /api/Products/productType
// @desc    Fetch all productType
// @access  private
router.get('/producttype', auth, async (req, res) => {
    try {
        const allproductType = await Products.find().distinct('producttype');
        res.json(allproductType);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error! Contact Administrator");
    }
});

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

// @api     Get /api/Products/category
// @desc    Fetch all category of req.product
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

module.exports = router;