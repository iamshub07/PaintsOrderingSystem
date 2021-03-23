const { Router } = require('express')
const express = require('express')
// const { check, validationResult, body } = require('express-validator')
const router = express.Router()
const auth = require('../middleware/auth')
const orders = require('../models/Orders')
const Products = require('../models/Products')
const users = require('../models/Users')
// pagination
var mongoose = require('mongoose');
var paginate = require('paginate')({
	mongoose: mongoose
});


router.post('/add/:pid', auth, async (req, res) => {
	const cart = await orders.findOne({ user: req.user.email, paid: false })
	const product = await Products.findById(req.params.pid)

	const { quantity, description, amount } = req.body
	if (cart) {
		const cartProduct = {
			product: req.params.pid,
			quantity,
			price: amount,
			description,
			name: product.title,
			image: product.imageCode,
			productCode: product.productCode,
			dispatch: false,
		}
		cart.cart.unshift(cartProduct)
		await cart.save().then(() => {
			res.send("Item added to cart")
		})

	} else {
		const product = await Products.findById(req.params.pid)
		newCart = new orders({
			user: req.user.email,
			cart: {
				product: req.params.pid,
				quantity,
				price: amount,
				description,
				name: product.title,
				image: product.imageCode,
				productCode: product.productCode,
				dispatch: false
			}
		})
		newCart.save().then(() => {
			res.send('Item added to cart')
		})

	}
})
// Update shipping address
router.put('/shipping/:id', auth, async (req, res) => {
	const cart = await orders.findOne({ user: req.user.email, paid: false })
	cart.updateOne({
		shippingAddress: req.params.id
	}).then(() => {
		res.json({ msg: "Updated" })
	})
})


// get current cart items
router.get('/', auth, async (req, res) => {
	const cart = await orders.find({ user: req.user.email, paid: false })
	if (cart) {
		res.json(cart)
		// console.log(cart)
	}
})
// get list of orders for individual user
router.get('/orders/:page', auth, async (req, res) => {
	await orders.find({ user: req.user.email, paid: true }).paginate({ page: req.params.page }, function (err, orders) {
		res.json(
			orders
		)
	});
})
// get all orders
router.get('/all/orders', auth, async (req, res) => {

	const user = await users.findOne({ email: req.user.email })
	if (user.isAdmin) {
		const order = await orders.find({ paid: true, dispatch: false })
		if (order) {
			res.json(order)
		} else {
			res.json({ msg: "No orders found" })
		}
	} else {
		res.json({ msg: "Access Denied" })
	}

})

// get all orders
router.get('/all/dispatched/orders', auth, async (req, res) => {

	const user = await users.findOne({ email: req.user.email })
	if (user.isAdmin) {
		const order = await orders.find({ dispatch: true })
		if (order) {
			res.json(order)
		} else {
			res.json({ msg: "No orders found" })
		}
	} else {
		res.json({ msg: "Access Denied" })
	}

})
// get individual cart
router.get('/individual/order/:id', auth, async (req, res) => {
	const order = await orders.findById(req.params.id)

	if (order) {
		res.json(order)
	} else {
		res.json({ msg: "Order Not Found" })
	}

})

// delete item from cart
router.put('/remove/cart/:id', auth, async (req, res) => {
	try {
		const cart = await orders.updateOne(
			{ user: req.user.email, paid: false },
			{ $pull: { 'cart': { _id: req.params.id } } }
		)
		if (cart.nModified !== 0) {
			res.json({ msg: "DELETED" })
		} else {
			res.send("ERROR")
		}
	} catch (error) {
		console.log(error)
	}
})

// dispatch order
router.put('/dispatch/cart/:id/:name/:cell', auth, async (req, res) => {
	try {
		const cart = await orders.findById(req.params.id)
		cart.updateOne({
			dispatch: true,
			deliveryBoy: req.params.name,
			deliveryBoyCell: req.params.cell
		}).then(() => {
			res.json({ msg: "Updated" })
		})
	} catch (error) {
		console.log(error)
	}
})

// get individual cart
router.delete('/delete/cart/:id', auth, async (req, res) => {
	if (req.user.isAdmin) {
		const order = await orders.findByIdAndDelete(req.params.id)
		if (order) {
			res.json({ msg: "Item deleted" })
		}
	} else {
		res.json({ msg: "Access Denied" })
	}

})

module.exports = router