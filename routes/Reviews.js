const express = require('express')
const { check, validationResult, body } = require('express-validator')
const router = express.Router()
const auth = require('../middleware/auth')
const Review = require('../models/Reviews')
// pagination
var mongoose = require('mongoose');
var paginate = require('paginate')({
    mongoose: mongoose
});

router.post('/add/:p_id', auth, async (req, res) => {
    const { stars, comment } = req.body
    const user = await Review.findOne({ email: req.user.email, product: req.params.p_id })
    if (user) {
        res.json({ msg: "USER_EXISTS" })
    } else {
        feedback = new Review({
            email: req.user.email,
            stars,
            comment,
            product: req.params.p_id
        })
        await feedback.save().then(() => {
            res.json({ msg: "ADDED" })
        })
    }
})

router.get('/:p_id/:page', auth, async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.p_id }).paginate({ page: req.params.page }, function (err, reviews) {
            if (reviews.length > 0) {
                res.json(reviews)
            } else {
                res.json({ msg: "ERROR" })
            }
        });
    } catch (error) {
        console.log(error)
    }
})

router.delete('/delete/:id', auth, async (req, res) => {
    const reviews = await Review.findOneAndDelete({ _id: req.params.id, email: req.user.email })
    if (reviews) {
        res.json({ msg: 'DELETED' })
    } else {
        res.json({ msg: "NOT_DELETED" })
    }
})

module.exports = router
