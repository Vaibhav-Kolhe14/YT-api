const mongoose = require('mongoose')
const { DB_NAME } = require('../constants.js')

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\nMongoDB Connected...! :: DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log('MONGODB Connection Failed :: ', error);
        process.exit(1)
    }
}

module.exports = connectDB