const { Router } = require('express')
const express = require('express')
const { check, validationResult, body } = require('express-validator')
const router = express.Router()
const Users = require('../models/Users')
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const config = require('config')
const auth = require('../middleware/auth')
// const User = require('../models/Users')
const bcrypt = require('bcryptjs')

const Profile = require('../models/Profile')
const User = require('../models/Users')

var mongoose = require('mongoose');
var paginate = require('paginate')({
    mongoose: mongoose
});



// @route   GET api/users
// @desc    Fetch all users
// @access  private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await Users.findOne({ email: req.user.email })
        const profile = await Profile.findOne({ user: req.user.email })
        if (!user) {
            res.status(400).json({ msg: "There is no profile associated with this user" })
        } else {
            if (!profile) {
                res.json({ user })
            } else {
                res.json({
                    user,
                    address: profile
                })
            }
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})


// @route   GET api/users
// @desc    Fetch user with email
// @access  private
router.get('/specific/:email', auth, async (req, res) => {
    try {
        const user = await Users.findOne({ email: req.params.email })
        if (!user) {
            res.status(400).json({ msg: "There is no profile associated with this user" })
        } else {
            res.json(user)
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})

// @route   GET api/users
// @desc    Fetch all users
// @access  private
router.get('/:page/:limit', auth, async (req, res) => {
    const counts = await Users.countDocuments().exec();
    const pages = req.params.page;
    const limits = req.params.limit;
    const start = (Math.ceil(pages - 1) * limits);
    const end = pages * limits;

    const type = req.user.isAdmin

    if (type) {
        try {
            if (pages > (counts / limits) + 1) {
                res.json({ msg: "End Reached" })
            } else {
                const user = await Users.find({})
                if (user.length > 1) {
                    res.json(user.slice(start, end))
                } else {
                    res.json({ msg: "End reached" })
                }
            }
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server Error')
        }
    }
})

// router.get('/all/:page/:limit', async (req, res) => {
// const counts = await Products.countDocuments().exec();
// const pages = req.params.page;
// const limits = req.params.limit;
// const start = (Math.ceil(pages - 1) * limits);
// const end = pages * limits;
// if (pages > (counts / limits) + 1) {
// res.json({ msg: "End Reached" })
// } else {
// try {
// const product = await Products.find({})
// if (product) {
// res.json(product.slice(start, end))
// }
// } catch (error) {
// console.log(error)
// }
// }
// })
// 


// @route   POST api/users/sign-up
// @desc    Register new user
// @access  public
router.post('/signup', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
    check('contact', 'Contact is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({ errors: errors.array() })
    }

    const { name, email, contact, password, isAdmin, gst, isCustomer } = req.body

    try {
        let user = await Users.findOne({ email })
        if (user) {
            res.json({ errors: [{ msg: " User already exists" }] })
            return
        }
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'x',
            d: 'mp'
        }, true)
        user = new Users({
            name,
            email,
            contact,
            isAdmin,
            avatar,
            password,
            gst,
            isCustomer
        })
        // Encrypt password
        const salt = await bcrypt.genSalt(12)
        user.password = await bcrypt.hash(password, salt)
        await user.save().then(() => {
            try {
                profile = new Profile({
                    user: email
                })
                profile.save()
                console.log("Profile created")
            } catch (error) {
                console.log(error)
            }

        })
        // get token
        const payload = {
            user: {
                email,
                isAdmin: user.isAdmin
            }
        }
        jwt.sign(
            payload,
            config.get('jwtSecretKey'),
            (err, token) => {
                if (err) throw err
                res.json({ token })
            }
        )
    } catch (error) {
        return res.json({ errors: { msg: "Server error" } })
    }
})


// @route   PUT api/users/me/address
// @desc    Create user address
// @access  private
router.put('/me/address', [
    check('flat', 'Flat or plot number is required').not().isEmpty(),
    check('street', 'Street is required').not().isEmpty(),
    check('pincode', 'Pincode is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty(),
    check('poc', 'POC (Person of contact) is required').not().isEmpty(),
    check('district', 'District is required').not().isEmpty()
], auth, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { flat, street, city, pincode, state, country, poc, pocName, district } = req.body

    const newAddress = {
        flat,
        street,
        city,
        state,
        district,
        pincode,
        country,
        poc,
        pocName
    }
    try {
        // console.log(user)
        let profile = await Profile.findOne({ user: req.user.email })
        profile.address.unshift(newAddress)
        await profile.save().then(() => {
            res.json(profile.address)
        })
    } catch (error) {
        console.log(error.message);
    }
})


// @route   DELETE api/users/me/address
// @desc    Delete user address
// @access  private

router.delete('/me/address/delete/:id', auth, async (req, res) => {
    try {
        const profile = await Profile.updateOne(
            { user: req.user.email },
            { $pull: { 'address': { _id: req.params.id } } }
        )
        if (profile.nModified !== 0) {
            res.json({ msg: "DELETED" })
        } else {
            res.send("ERROR");
        }
    } catch (error) {
        console.log(error)
    }
})

// /////////////////////////////////////////////////////////////////
// @route   DELETE /profile/shipping/:email
// @desc    Create user address
// @access  private

router.get('/profile/shipping/:email', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.email
        })
        if (profile) {
            res.json(profile)
        } else {
            res.json({ msg: "Profile not found" })
        }
    } catch (error) {
        console.log(error)
    }
})
// /////////////////////////////////////////////////////////////////


// @route   Get api/users/delete
// @desc    delete current user
// @access  private
router.delete('/delete', auth, async (req, res) => {
    try {
        const user = await Users.findOneAndDelete({ email: req.user.email })
        const profile = await Profile.findOneAndDelete({ user: req.user.email })
        if (!user) {
            res.status(400).json({ msg: "There is no profile associated with this user" })
        } else {
            if (!profile) {
                res.json({ msg: 'There is no profile associated with this user' })
            } else {
                res.json({ msg: 'Profile deleted permanently and cannot be recovered' })
            }
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ msg: 'Server Error' })
    }
})
// @route   Get api/users/delete
// @desc    delete a user
// @access  admin
router.delete('/delete/:id', auth, async (req, res) => {
    const type = req.user.isAdmin
    if (type) {
        try {
            const user = await Users.findById(req.params.id)
            if (user) {
                let profile = user.email
                const deleteprofile = await Profile.findOneAndDelete({ user: profile })
                if (deleteprofile) {
                    console.log('Profile deleted')
                } else {
                    console.log("No profile associated with this user")
                }
            }
            const deletedUser = await Users.findByIdAndDelete(req.params.id).then(() => {
                res.send("Profile deleted")
            })
        } catch (error) {
            console.log(error)
        }
    } else {
        res.send("You don't have privilages to delete a user")
    }

})

// @route   PUT api/users/activate
// @desc    active a deactivated user
// @access  admin

router.put('/activate/:id', auth, async (req, res) => {
    const type = req.user.isAdmin
    if (type) {
        const user = await Users.findById(req.params.id)
        if (user) {
            user.updateOne({
                isActive: true
            }).then(() => {
                res.json({ msg: "User activated" })
            })
        } else {
            res.json({ msg: "User not found" })
        }
    } else {
        res.json({ msg: "Access Denied" })
    }

})

// @route   PUT api/users/deactivate
// @desc    deactivate a user
// @access  admin

router.put('/deactivate/:id', auth, async (req, res) => {
    const type = req.user.isAdmin
    if (type) {
        const user = await Users.findById(req.params.id)
        if (user) {
            user.updateOne({
                isActive: false
            }).then(() => {
                res.json({ msg: "User deactivated" })
            })
        } else {
            res.json({ msg: "User not found" })
        }
    } else {
        res.json({ msg: "Access Denied" })
    }

})

// @route   PUT api/users/switch
// @desc    switch a user as customer/dealer
// @access  admin

router.put('/switch/:id', auth, async (req, res) => {
    const type = req.user.isAdmin
    if (type) {
        const user = await Users.findById(req.params.id)
        if (user) {
            user.updateOne({
                isCustomer: !user.isCustomer
            }).then(() => {
                res.json({ msg: "Updated" })
            })
        } else {
            res.json({ msg: "User not found" })
        }
    } else {
        res.json({ msg: "Access Denied" })
    }

})

module.exports = router