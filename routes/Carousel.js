const { Router } = require('express')
const express = require('express')
const { check, validationResult, body } = require('express-validator')
const router = express.Router()
const Carousel = require('../models/Carousel')
const auth = require('../middleware/auth')

router.get('/all', async (req, res) => {
    const pics = await Carousel.find({})
    if (pics.length > 0) {
        res.json(pics)
    } else {
        res.json({ msg: "EMPTY" })
    }
})

router.post('/add', auth, async (req, res) => {
    const { image, description } = req.body
    const pics = await Carousel.findOne({ imageCode: image })
    if (!pics) {
        pic = new Carousel({
            imageCode: image,
            description
        })
        await pic.save().then(() => {
            res.json({ msg: "added" })
        })
    } else {
        res.json({ msg: 'Image already exits' })
    }

})

router.delete('/delete/:id', auth, async (req, res) => {
    await Carousel.findByIdAndDelete(req.params.id).then(() => {
        res.json({ msg: "Deleted" })
    })
})


module.exports = router