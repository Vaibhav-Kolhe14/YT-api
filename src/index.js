require('dotenv').config()
const { app } = require('./app.js')
const connectDB = require('./db/connectDB')

const PORT = process.env.PORT || 4000


connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
})
.catch((err) => {
    console.log("Mongo DB Connection Failed...! :: ", err);
})