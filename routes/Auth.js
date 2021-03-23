const { Router } = require('express')
const express = require('express')
const { check, validationResult, body } = require('express-validator')
const router = express.Router()
const Users = require('../models/Users')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')
const User = require('../models/Users')
const sms = require('fast-two-sms')
const mail = require('nodemailer')

const transporter = mail.createTransport({
    service: 'gmail',
    auth: {
        user: config.get("EMAIL"),
        pass: config.get('PASS')
    }
})

//route     POST api/auth/login
//@desc     User login
// Access   public
router.post('/login', [
    check('email', 'Email is required').not().isEmpty(),
    check('password', 'Password is required').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { email, password } = req.body
    try {
        let user = await Users.findOne({ email })
        if (user) {
            const isMatching = await bcrypt.compare(password, user.password)
            if (!isMatching) {
                return res.json({ errors: [{ msg: 'Invalid Credentials' }] })
            }
            const payload = {
                user: {
                    email,
                    isAdmin: user.isAdmin,
                    customerType: user.isCustomer,
                    active: user.isActive
                }
            }
            jwt.sign(
                payload,
                config.get('jwtSecretKey'),
                (err, token) => {
                    if (err) throw err
                    res.json({
                        token,
                        isAdmin: user.isAdmin,
                        customerType: user.isCustomer,
                        active: user.isActive
                    })
                }
            )

        } else {
            let conUser = await Users.findOne({ contact: parseInt(email) })
            if (conUser) {
                const isMatching = await bcrypt.compare(password, conUser.password)
                if (!isMatching) {
                    return res.json({ errors: [{ msg: 'Invalid Credentials' }] })
                }
                const payload = {
                    user: {
                        email: conUser.email,
                        isAdmin: conUser.isAdmin,
                        customerType: conUser.isCustomer,
                        active: conUser.isActive
                    }
                }
                jwt.sign(
                    payload,
                    config.get('jwtSecretKey'),
                    (err, token) => {
                        if (err) throw err
                        res.json({
                            token,
                            isAdmin: conUser.isAdmin,
                            customerType: conUser.isCustomer,
                            active: conUser.isActive
                        })
                    }
                )
            } else {
                return res.json({ errors: [{ msg: 'Invalid Credentials' }] })
            }
        }
    } catch (error) {
        res.send(error)
    }
})

router.put('/forgot/password', [
    check("contact", "Please enter your registered mobile number").not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    try {
        if (!errors.isEmpty()) {
            res.json({ error: [errors.array()] })
        } else {
            const { contact } = req.body
            const user = await User.findOne({ contact })
            if (user) {
                let otp = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)
                user.updateOne({ otp }).then(up => {
                    let text = { authorization: config.get('sms_API'), message: "OTP: " + otp, numbers: [user.contact] }
                    sms.sendMessage(text).then(response => {
                        console.log(response)
                        if (response.return) {
                            res.send("SENT")
                        } else {
                            res.json({ errors: response.array() })
                        }
                    })
                    const mailOptions = {
                        from: 'sadarsh216@gmail.com',
                        to: user.email,
                        subject: 'AP Paints OTP',
                        text: 'OTP for your AP Paints account is: ' + otp
                    }
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error)
                        } else {
                            console.log('Email sent' + info.response)
                        }
                    })
                })
            } else {
                res.send({ msg: "There is no account associated with this phone number" })
            }
        }
    } catch (err) {
        res.send(err)
    }

})

router.post('/verify/otp', [
    check("password", "Please enter the otp send to your regstered phone number and Email ID").not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req)
    try {
        if (!errors.isEmpty()) {
            res.json({ error: [errors.array()] })
        } else {
            const { password, contact } = req.body
            console.log(password + " -- " + contact)
            const user = await Users.findOne({ contact: parseInt(contact) })
            if (user) {
                if (user.otp === parseInt(password)) {
                    res.send("Verified")
                } else {
                    res.send({ msg: 'Wrong OTP' })
                }
            } else {
                res.send("No user found")
            }
        }
    } catch (err) {
        console.log(err)
    }
})

router.put('/reset/password', [
    check("password", "Please enter a password").not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.json({ errors: [errors.array()] })
    } else {
        try {
            const { password, contact } = req.body
            const user = await Users.findOne({ contact })
            // password hash
            const salt = await bcrypt.genSalt(12)
            Newpassword = await bcrypt.hash(String(password), salt)
            if (user) {
                await user.updateOne({ password: Newpassword }).then(() => {
                    res.send('SUCCESS')
                })
            } else {
                res.send("FAILED")
            }
        } catch (error) {
            console.log(error)
        }
    }
})

module.exports = router
