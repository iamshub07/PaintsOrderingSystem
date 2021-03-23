const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

const dbConnect = async () => {
    mongoose.set('useCreateIndex', true);
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to mongo db")
    } catch (error) {
        console.error(error.message)
        process.exit(1)
    }
}

module.exports = dbConnect