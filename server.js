const bodyParser = require('body-parser');
const express = require('express');
const dbConnect = require('./config/db')
const app = express();
const PORT = process.env.PORT || 5000

// Database connection #mongodb
dbConnect()
//app.get('/', (req, res) => res.send('hello world! I am Adarsh Singh '))
app.use('/images', express.static("./uploads"))
app.use('/files', express.static('./files'))
app.use(bodyParser.urlencoded({
    extended: true
}));
// initialize middleware
// for parsingh body
app.use(express.json({ extended: true }))

// testing 123


// Defining api routes
app.use('/api/auth', require('./routes/Auth'))
app.use('/api/users', require('./routes/Users'))
app.use('/api/products', require('./routes/Products'))
app.use('/api/cart', require('./routes/Cart'))
app.use('/api/order', require('./routes/Order'))
// Payment api
app.use('/api/checkout', require('./routes/PaymentRoute'))
app.use('/api/review', require('./routes/Reviews'))
//  Products description and additional files
app.use('/api/details', require('./routes/ProductDetails'))
app.use('/api/offers', require('./routes/Offers'))
app.use('/api/carousel', require('./routes/Carousel'))


// app.use('/api/getFile/:path', require('./routes/ImageController'))

app.listen(PORT, () => {
    console.log('Server started at port : ' + PORT)
});
