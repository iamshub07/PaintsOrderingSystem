const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function (req, res, next) {
    // get auth token 
    const token = req.header('auth-token')

    //  check if there's a token or not
    if (!token) {
        return res.status(401).json({msg: "No token, authorization denied"})
    }
    // verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecretKey'))
        req.user = decoded.user
        next()
    } catch (error) {
       console.log(error)
        res.status(401).json({ msg:"Invalid auth token" })
    }
}