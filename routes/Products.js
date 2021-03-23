const express = require('express')
const { check, validationResult, body } = require('express-validator')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const Products = require('../models/Products')
const Review = require('../models/Reviews')
var mongoose = require('mongoose');
const ProductDetails = require('../models/ProductDetails')
var paginate = require('paginate')({
    mongoose: mongoose
});

// setting up storage for images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        // cb(null, file.originalname + '_' + Date.now() + ".jpg")
        cb(null, file.originalname)
    }
})

// setting up storage for pdfs
const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './files/')
    },
    filename: (req, file, cb) => {
        // cb(null, file.originalname + '_' + Date.now() + ".jpg")
        cb(null, file.originalname)
    }
})
// pdf setup
const pdfUpload = multer({ storage: pdfStorage }).array('pdf', 4)
router.post('/pdfUpload', function (req, res, next) {
    pdfUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            res.send("Multer error ocured")
        } else if (err) {
            // An unknown error occurred when uploading.
            res.send("Unknown error ccured")
        }
        // Everything went fine.
        res.send("Success")
    })
})

const upload = multer({ storage: storage }).array('Images', 4)

router.post('/upload', function (req, res, next) {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            res.send("Multer error ocured")
        } else if (err) {
            // An unknown error occurred when uploading.
            res.send("Unknown error ccured")
        }
        // Everything went fine.
        res.send("Success")
    })
})


router.get('/all/:page/:limit', async (req, res) => {
    const counts = await Products.countDocuments().exec();
    const pages = req.params.page;
    const limits = req.params.limit;
    const start = (Math.ceil(pages - 1) * limits);
    const end = pages * limits;
    if (pages > (counts / limits) + 1) {
        res.json({ msg: "End Reached" })
    } else {
        try {
            const product = await Products.find({})
            if (product) {
                res.json(product.slice(start, end))
            }
        } catch (error) {
            console.log(error)
        }
    }
})


// @api     Get /api/products/
// @desc    Fetch all products
// @access  public


// router.get('/:page/:limit', async (req, res) => {
// const counts = await Products.countDocuments().exec();
// const pages = req.params.page;
// const limits = req.params.limit;
// const start = (Math.ceil(pages - 1) * limits);
// const end = pages * limits;
// if (pages > (counts / limits) + 1) {
//     res.json({ msg: "End Reached" })
// } else {
//     try {
//         const product = await Products.find({})
//         if (product) {
//             res.json(product.slice(start, end))
//         }
//     } catch (error) {
//         console.log(error)
//     }
// }
// })

//  @api    Get /api/products/seacrh
// @desc    Fetch product with with search context
// @access  public
router.get('/search/:context', async (req, res) => {
    //const { context } = req.body;
    const product = await Products.find({ "title": { $regex: ".*" + req.params.context + "*.", '$options': 'i' } })

    // const product = await Products.find({ $text: { $search: "\"" + context + "\"", $caseSensitive: false } })
    if (product.length !== 0) {
        res.json(product)
    } else {
        const product = await Products.find({ "productCode": { $regex: ".*" + req.params.context + "*.", '$options': 'i' } })
        if (product.length !== 0) {
            res.json(product)
        } else {
            res.json({ msg: "EMPTY" })
        }
    }
})


// @api     Get /api/products
// @desc    Fetch product with id
// @access  public
router.get('/singleItem/:id', async (req, res) => {
    const product = await Products.findOne({ productCode: req.params.id })
    if (product) {
        res.json(product)
    }
})

// @api     Get /api/products
// @desc    Fetch product with brand name
// @access  public
router.get('/specific/:category/:subcategory/:page/:limit', async (req, res) => {
    const count = await Products.countDocuments({ category: req.params.category, subcategory: req.params.subcategory }).exec()
    const page = req.params.page
    const limit = req.params.limit
    console.log(Math.ceil(count / limit))
    const startIndex = (page - 1) * limit
    const endIndex = page * limit;

    if (page > (count / limit) + 1) {
        res.json({ msg: "End Reached" })
    } else {
        try {
            const product = await Products.find({ category: req.params.category, subcategory: req.params.subcategory })
            // const product = await Products.find({})
            if (product) {
                res.json(product.slice(startIndex, endIndex))
            }

        } catch (error) {
            console.log(error)
        }
    }
})

// @api     Get /api/products/delete/:id
// @desc    delete a product with id
// @access  private
router.delete('/delete/:id', auth, async (req, res) => {
    const product = await Products.findByIdAndDelete(req.params.id)
    try {
        if (product) {
            res.json("Product deleted")
        }
        else {
            res.send("This poduct doesnot exist")
        }
    } catch (error) {
        res.send(error)
    }
})

//  @api    POST /api/products/add
//  @desc   Add products
//  @access private(only admin)
router.post('/addproduct', [
    check('productType', 'product type is required').not().isEmpty(),
    check('brand', 'Brand name is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('subBrand', 'Sub brand is required').not().isEmpty(),
    check('title', 'Product name is required').not().isEmpty(),
    check('productCode', 'Product code is required').not().isEmpty(),
    check('subcategory', 'Sub-category is required').not().isEmpty(),
    check('stockCount', 'Stock is required').not().isEmpty(),
    check('imagecode', 'Image code is required').not().isEmpty(),
    check('dealerPrice', 'Dealer Price is required').not().isEmpty(),
    check('customerPrice', 'Customer Price is required').not().isEmpty()
    // add product code here to check if products is not repeteadly entered
], auth, upload,
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        try {
            const product = await Products.findOne({ productCode: req.body.productCode })
            if (product) {
                res.send("There is a already a product with " + req.body.productCode + " product code")
            } else {
                const {
                    productType,
                    brand,
                    category,
                    subBrand,
                    title,
                    productCode,
                    subcategory,
                    imagecode,
                    dealerPrice,
                    customerPrice,
                } = req.body
                newProduct = new Products({
                    productType,
                    brand,
                    category,
                    subBrand,
                    title,
                    productCode,
                    subcategory,
                    imagecode,
                    dealerPrice,
                    customerPrice,
                })
                await newProduct.save().then(() => {
                    res.send("product added")
                })
                console.log(newProduct)
            }
        } catch (error) {
            res.send(error)
        }
    });


//  @api    POST /api/products/addproductdetails
//  @desc   Add productsdetails
//  @access private(only admin)
router.post('/addproductdetail', [
    check('product', 'product is required').not().isEmpty(),
    //  check('weight', 'weight is required').not().isEmpty(),
    check('productCode', 'Product code is required').not().isEmpty(),
    // add product code here to check if products is not repeteadly entered
], auth, upload,
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        try {
            const product = await Products.findOne({ _id: req.body.product });
            console.log(product);
            if (!product) {
                res.send("There is a no product with this product id")
            } else {
                const {
                    product,
                    shade,
                    productCode,
                    weight,
                    title,
                    description,
                    pdfname,
                    colorcode
                } = req.body
                const prodDetails = {};
                prodDetails.product = product;
                prodDetails.shade = shade;
                prodDetails.productCode = productCode;
                prodDetails.weight = weight;
                prodDetails.title = title;
                prodDetails.description = description;
                prodDetails.pdfname = pdfname,
                    prodDetails.colorcode = colorcode;
                productDet = new ProductDetails(prodDetails);
                await productDet.save().then(() => {
                    res.send("product added")
                })
                console.log(productDet);
            }

        } catch (error) {
            console.log(error);
            res.send("server error")
        }
    });


// //  @api    POST /api/:id/review
// //  @desc   Add reviews
// //  @access private
// // router.post('/add/review/:id', [
// //     check('stars','Please select stars of your choice').not().isEmpty(),
// //     check('comment', 'Description cannot be empty').not().isEmpty(),
// // ], auth, async (req, res) => {
// //     const errors = validationResult(req)
// //     if (!errors.isEmpty()) {
// //         return res.status(400).json({ errors: errors.array() })
// //     }
// //     try {
// //         const product = await Products.findById(req.params.id)
// //         if (product) {
// //             // console.log(req.user)
// //             const alreadyReviewed = product.reviews.find(r => String(r.email) == req.user.email)
// //             if (alreadyReviewed) {
// //                 res.send("already reviewed")
// //             } else {
// //                 const { comment, stars } = req.body
// //                 const review = {
// //                     email: req.user.email,
// //                     comment,
// //                     stars
// //                 }
// //                 product.reviews.unshift(review)
// //                 await product.updateOne()
// //                 res.send("review posted successfully")
// //             }
// //         }
// //     } catch (error) {
// //         res.send(error.message)
// //     }
// // })
// // @api     post /api/products/brands
// // @desc    add a brand with id
// // @access  only admin
// router.post('/brands/add', [
//     check('brand', 'Brand is required').not().isEmpty()
// ], auth, async (req, res) => {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() })
//     }
//     const { brand } = req.body
//     const getData = await Brands.findOne({ name: brand })
//     if (getData) {
//         res.json({ msg: "Brand already exists" })
//     } else {
//         try {
//             newBrand = new Brands({
//                 name: brand
//             })
//             await newBrand.save()
//             res.json({ msg: "Brand added" })
//         } catch (error) {
//             res.json({ errors: error.message })
//         }
//     }
// })
// // @api     delete /api/products/brands/delete/:id
// // @desc    delete a brand with id
// // @access  private(only admin)
// router.delete('/brands/delete/:id', auth, async (req, res) => {

//     const getData = await Brands.findByIdAndDelete(req.params.id)
//     if (getData) {
//         res.json({ msg: "Brand deleted" })
//     } else {
//         res.json({ msg: "There is no such brand available to delete" })
//     }
// })

// // @api     Get /api/products/brands
// // @desc    get all brands
// // @access  public
// router.get('/brands/all', async (req, res) => {
//     const brand = await Brands.find({})
//     try {
//         if (brand) {
//             res.json(brand)
//         } else {
//             res.json({ msg: "Brands are not added yet" })
//         }
//     } catch (error) {
//         console.log(error.message)
//     }
// })

// @api     post /api/products/category/add
// @desc    adding a category
// @access  private only admin
router.post('/category/add', [
    check('category', 'Category name is required').not().isEmpty(),
    check('subcategory', 'Sub-Category name is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.json(errors)
    }
    const category = await Category.findOne({ category: req.body.category, subcategory: req.body.subcategory })
    if (category) {
        res.json({ msg: "Category already exists" })
    } else {
        const { category, subcategory, imageCode } = req.body
        newCategory = new Category({
            category,
            subcategory,
            imageCode
        })
        await newCategory.save().then(() => {
            res.json({ msg: "Category created" })
        })
    }
})
// @api     get api/products/category
// @desc    FETCH ALL CATEGORIES
// @access  public
router.get("/category/all", async (req, res) => {
    const category = await Category.find({})
    console.log("Hey")
    if (category) {
        res.json(category)
    } else {
        res.json({ msg: " There are no categories in this brand" })
    }
})
// @api     get api/products/category
// @desc    FETCH ALL CATEGORIES WITH BRAND NAME
// @access  public
// router.get("/category/:brand", async (req, res) => {
//     const category = await Category.find({ brand: req.params.brand })
//     if (category) {
//         res.json(category)
//     } else {
//         res.json({ msg: " There are no categories in this brand" })
//     }
// })
// @api     delete api/products/category/delete/:id
// @desc    delete a category
// @access  admin
router.delete('/category/delete/:id', auth, async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (category) {
        res.json({ msg: 'Category deleted' })
    } else {
        res.json('Category cannot be found')
    }
})
// @api     post api/products/subcategory/add
// @desc    add a new sub-category
// @access  private

// router.post('/subcatgory/add', [
//     check('brand', 'Brand name is required').not().isEmpty(),
//     ccheck('category', 'Category name is required').not().isEmpty(),
//     check('subcategory', 'Sub category name is required').not().isEmpty()
// ], auth, async(req, res) => {
//         const errors = validationResult(req)
//         if (!errors.isEmpty()) {
//             res.json({errors: errors.array()})
//         }
//         const category = await SubCategory.findOne({subcategory: req.body.subcategory})
// })
router.post('/update/stock/:p_id', auth, async (req, res) => {
    const { title, category, subcategory, imageCode, customerPrice, dealerPrice, stockCount, weight } = req.body
    const product = await Products.findOne({ productCode: req.params.p_id })
    if (product) {
        product.updateOne({
            title,
            category,
            subcategory,
            imageCode,
            customerPrice,
            dealerPrice,
            stockCount,
            weight
        }).then(() => {
            res.json({ msg: "stocks updated" })
        })
    } else {
        res.json({ msg: "Product not found" })
    }
});

module.exports = router;