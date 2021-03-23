const express = require('express')
const router = express.Router()
const PaytmChecksum = require('../paytm/checksum/checksum')
const { check, validationResult, body } = require('express-validator')
const config = require('config')
// const { uuid } = require('uuidv4')
const { v4 } = require('uuid')
const { json } = require('express')
const cart = require('../models/Orders')
const sms = require('fast-two-sms')
const mail = require('nodemailer')
const User = require('../models/Users')
const auth = require('../middleware/auth')
const Orders = require('../models/Orders')

// invoice package
var easyinvoice = require('easyinvoice');
const PDFDocument = require('pdfkit');
var fs = require('fs')
// var pdf = require('html-pdf');
const Profile = require('../models/Profile')
// Convert number into word
const { ToWords } = require('to-words')


const transporter = mail.createTransport({
  service: 'gmail',
  auth: {
    user: config.get("EMAIL"),
    pass: config.get('PASS')
  }
})


router.post('/payment', async (req, res) => {

  const emailid = req.body.email
  const amountx = req.body.amount
  const cust_id = req.body.id
  const cartId = req.body.cartId
  const orderid = v4()

  console.log(amountx + " " + emailid + " " + cust_id + " " + cartId)

  const currentCart = await cart.findById(cartId)
  currentCart.updateOne({
    orderId: orderid,
    totalAmount: amountx
  }).then(() => {
    console.log("Updated")
  })

  var paytmParams = {};

  /* initialize an array */
  paytmParams["MID"] = config.get('MID'),
    paytmParams["ORDER_ID"] = orderid,
    paytmParams['WEBSITE'] = config.get('WEBSITE'),
    paytmParams['CHANNEL_ID'] = config.get('CHANNEL_ID'),
    paytmParams['INDUSTRY_TYPE_ID'] = config.get("INDUSTRY_TYPE"),
    paytmParams['CALLBACK_URL'] = 'https://ap-paints.herokuapp.com/api/checkout/callback',
    paytmParams['TXN_AMOUNT'] = String(amountx),
    paytmParams['EMAIL'] = String(emailid),
    paytmParams['CUST_ID'] = String(cust_id)

  await PaytmChecksum.genchecksum(paytmParams, config.get('M_KEY'), function (err, checkSum) {
    let txn_url = "https://securegw-stage.paytm.in/order/process"
    let form_field = ""
    for (x in paytmParams) {
      form_field += "<input type='hidden' name='" + x + "' id='" + x + "' value='" + paytmParams[x] + "'/>"
    }
    form_field += " <input type='hidden' name='CHECKSUMHASH' value='" + checkSum + "'/>"
    let html = '<html><body><center><h1>Please do not close or refresh the page</h1></center><form method="post" action="' + txn_url + '"name="f1">' + form_field + '</form><script type="text/javascript">document.f1.submit()</script></body></html>'
    res.writeHead(200, { 'content-type': 'text/html' })
    res.write(html)
    res.end()
  })

})

router.post('/callback', async (req, res) => {

  const status = req.body.STATUS
  const orderid = req.body.ORDERID
  const amount = req.body.TXNAMOUNT
  const txn = req.body.TXNID
  const bankTxnID = req.body.BANKTXNID
  const title = req.body.STATUS
  let html = `
    <!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
  </head>
  <body>
    <center>
         <h3>${title}</h3>

         <div style="margin: 8px" class="card">
              <div class="card-body">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">Status</th>
                      <th scope="col">${status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Amount</td>
                      <td>${amount}</td>
                    </tr>
                    <tr>
                      <td>Order Id</td>
                      <td>${orderid}</td>
                    </tr>
                    <tr>
                      
                      <td>Transaction ID</td>
                      <td>${txn}</td>
                    </tr>
                     <tr>

                      <td>Bank TXN ID</td>
                      <td>${bankTxnID}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
        </div>
        <button class="btn btn-success">Continue Shopping</button>
    </center>
    <script>
document.querySelector("button").onclick = function() {
  console.log("Hey");
  window.ReactNativeWebView.postMessage("done");
  window.postMessage("done");
}
</script>
    <!-- Optional JavaScript; choose one of the two! -->
    <!-- Option 1: jQuery and Bootstrap Bundle (includes Popper) -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script>
    <!-- Option 2: jQuery, Popper.js, and Bootstrap JS
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.min.js" integrity="sha384-w1Q4orYjBQndcko6MimVbzY0tgp4pWB4lZ7lr30WKz0vr/aWKhXdBNmNb5D92v7s" crossorigin="anonymous"></script>
    -->
  </body>
</html>
    `
  res.writeHead(200, { 'content-type': 'text/html' })
  res.write(html)
  res.end()

  PaytmChecksum.verifychecksum(JSON.stringify(req.body), config.get('M_KEY'), req.body.CHECKSUMHASH)
  if (PaytmChecksum) {
    const currentCart = await cart.findOne({ orderId: orderid })
    const user = await User.findOne({ email: currentCart.user })

    currentCart.updateOne({
      txnId: txn,
      bankTxnId: bankTxnID,
      paid: true
    }).then(() => {

      let text = { authorization: config.get('sms_API'), message: "We have recieved an order  of " + amount + " .Click the link to view details http://ap-paints.herokuapp.com/api/checkout/invoice/" + currentCart._id, numbers: [user.contact, 9920331415] }
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
        to: "" + user.email + ",soni.rms18@gmail.com",
        subject: 'AP Paints order confirmation',
        text: 'We have recieved an order  of ' + amount + ' .Click the link to view details http://ap-paints.herokuapp.com/api/checkout/invoice/' + currentCart._id
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
    console.log("nuppp")
  }
  // res.send("Something recieved check console")
})


router.post('/cod', [
  check('amount', "Amount is required").not().isEmpty(),
  check('cartId', 'Cart ID is required').not().isEmpty()
], auth, async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  // const emailid = req.body.email
  const amountx = req.body.amount
  // const cust_id = req.body.id
  const cartId = req.body.cartId
  const orderid = v4()

  const currentCart = await cart.findById(cartId)
  if (currentCart) {
    const user = await User.findOne({ email: currentCart.user })
    currentCart.updateOne({
      orderId: orderid,
      totalAmount: amountx,
      paid: true,
      cod: true
    }).then(() => {
      let text = { authorization: config.get('sms_API'), message: "We have recieved an order  of " + amountx + " .Click the link to view details http://ap-paints.herokuapp.com/api/checkout/invoice/" + cartId, numbers: [user.contact, 9920331415] }
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
        subject: 'AP Paints order confirmation',
        text: 'We have recieved an order  of ' + amountx + ' .Click the link to view details http://ap-paints.herokuapp.com/api/checkout/invoice/' + cartId
      }
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log('Email sent' + info.response)
        }
      })
    })
  }
})

router.get('/invoice/:id', async (req, res) => {
  const cart = await Orders.findById(req.params.id)
  // const address = await Profile
  const profile = await Profile.findOne({
    user: cart.user
  })
  const user = await User.findOne({ email: cart.user })
  console.log("User is customer : " + user.isCustomer)
  let address = null
  for (var i = 0; i < profile.address.length; i++) {
    if (profile.address[i]._id == cart.shippingAddress) {
      address = profile.address[i]
    }
  }
  // number to word configuration
  const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
    }
  });


  let items = ""
  let amount = 0
  for (var j = 0; j < cart.cart.length; j++) {
    items += `<tr>
    <td class="left">${cart.cart[j].name}</td>
    <td class="left">${cart.cart[j].price / cart.cart[j].quantity}</td>
    <td class="center">${cart.cart[j].quantity}</td>
    <td class="right" style="text-align:center">${(cart.cart[j].price / cart.cart[j].quantity) * cart.cart[j].quantity}</td>
    </tr>`
    amount = amount + parseInt(cart.cart[j].price)
  }
  let gst = ((amount * 0.8475) * 0.09).toFixed(2)
  let deliveryCharge = cart.totalAmount - amount
  let total = amount - (gst * 2)

  let words = toWords.convert(deliveryCharge + amount);
  // words = One Hundred Twenty Three Point Fourty Five
  console.log(words)
  var date = cart.date.toString().substring(0, 24 - 9)
  let details = ""
  if (user.isCustomer) {
    details += `
                <tr>
                <td class="left">
                <strong>Subtotal</strong>
                </td>
                <td class="right">${total.toFixed(2)}</td>
                </tr>
                <tr>
                <td class="left">
                <strong>CGST (9%)</strong>
                </td>
                <td class="right">${gst}</td>
                </tr>
                <tr>
                <td class="left">
                <strong>SGST (9%)</strong>
                </td>
                <td class="right">${gst}</td>
                </tr>
    `
  } else {
    details += ""
  }


  let html = ""
  html += `
              <!DOCTYPE html>
              <html lang="en">
              <head>
              <meta charset="UTF-8">
              <title>AP Paints | ${user.name}</title>
              <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-beta.2/css/bootstrap.css'>
              </head>
              <style>
              @media print {
              * {font-size:12px}
              // @page {
              // size: 8.3in 11.7in;
              // margin: 6mm 6mm 6mm 6mm;
              // }
              // body{
              //   transform: scale(0.7);
              //   //transform-origin:0.0;
              // }
              }
              .card-header{
              //background-color:#dc4d6e;
              }
              

              </style>
              <body>
              <div>
              <div class="card">
              <div class="card-header">
              <center style="font-size:18px">Tax Invoice<center>
              </div>
              <div class="card-body">
              <div class="row mb-4">
              <div class="col-sm-2">
              <div>
              <img src="http://ap-paints.herokuapp.com/images/default.png" style="height:10rem; width:10rem" alt="Flowers in Chania">
              </div>
              </div>
              <div class="col-sm-4">
              <div>
              <strong>AP Paints</strong>
              </div>
              <div>Shop no 09, plot no. E-58</div>
              <div>Kohinoor Apt. Sion-Trombay Road</div>
              <div>Chembu Naka - 400071</div>
              <div>GSTIN/UIN : 27AHVPJ1896M2ZB</div>
              <div>State Name: Maharashtra, Code : 27</div>
              <div>Phone: +91 9920331415</div>
              </div>
              <div class="col-sm-3">
              <div>
              <strong>Shipping Address</strong>
              </div>
              <div>${address.flat + " " + address.street}</div>
              <div>${address.city + " " + address.state}</div>
              <div>${address.country + " - " + address.pincode}</div>
              <div>${address.pocName + " - " + address.poc}</div>
              </div>
              <div class="col-sm-3">
              <div>
              <strong>From</strong>
              </div>
              <div>Name : ${user.name}</div>
              <div>Email : ${user.email}</div>
              <div>Cell : ${user.contact}</div>
              <div>GST : ${user.gst}</div>
              </div>
              </div>
              <div class="table-responsive-sm">
              <div style="text-align:right"> <p style="text-alignt:left"><strong>Date : ${date}</strong></p></div>
              <br>
              <table class="table table-clear">
              <thead>
              <tr>
              <th>Item</th>
              <th class="right">Unit Cost</th>
              <th class="center">Qty</th>
              <th class="right">Total (GST Included)</th>
              </tr>
              </thead>
              <tbody>
              ${items}
              </tbody>
              </table>
              </div>
              <div class="row">
              <div class="col-lg-4 col-sm-5">
              </div>
              <div class="col-lg-4 col-sm-5 ml-auto">
              <table class="table table-clear">
              <tbody>
              ${details}
              <tr>
              <td class="left">
              <strong>Delivery Charge</strong>
              </td>
              <td class="right">
              ${deliveryCharge}
              </td>
              </tr>
              <tr>
              <td class="left">
              <strong>Total</strong>
              </td>
              <td class="right">
              <strong>${deliveryCharge + amount}</strong>
              </td>
              </tr>
              </tbody>
              </table>
              </div>
              </div>
              <p>(Amount chargeable in words)</p>
              <p><strong>Tax Amount : INR </strong>${words}</p>
              <hr/>
              <div style="text-align: right">
              <p><strong>Authorized Signatory</strong></p>
              <p style="margin-top: -15px;">(AP Paints)</p><br>
              <p>___________________</p>
              <div>
              </div>
              </div>

              </div>
              <footer>
              <p style="text-align:center">This is a computer generated invoice</p>
              </footer>
              </div>
              <center>
              <button style="margin-top:10px" onclick="window.print()">Print Invoice</button>
              </center>
              </body>
              <script>
              window.print()
              </script>
              </html>
`


  // var options = { format: 'Letter' };

  // pdf.create(html, options).toFile('./businesscard.pdf', function (err, res) {
  //   if (err) return console.log(err);
  //   console.log(res); // { filename: '/app/businesscard.pdf' }
  // });


  res.writeHead(200, { 'content-type': 'text/html' })
  res.write(html)
  res.end()
})

module.exports = router