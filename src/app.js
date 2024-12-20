const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

//Routes Import
const userRouter = require('./routes/userRoutes.js')
const healthcheckRouter = require('./routes/healthcheckRoutes.js')
const tweetRouter = require("./routes/tweetRoutes.js")
const subscriptionRouter = require('./routes/subscriptionRoutes.js')
const videoRouter = require('./routes/videoRoutes.js')
const commentRouter = require('./routes/commentRoutes.js')
const likeRouter = require('./routes/likeRoutes.js')
const playlistRouter = require('./routes/playlistRoutes.js')
const dashboardRouter = require('./routes/dashboardRoutes.js')

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.static('public'))
app.use(cookieParser())

//Routes
app.use('/users', userRouter)
app.use("/healthcheck", healthcheckRouter)
app.use("/tweets", tweetRouter)
app.use("/subscriptions", subscriptionRouter)
app.use("/videos", videoRouter)
app.use("/comments", commentRouter)
app.use("/likes", likeRouter)
app.use("/playlist", playlistRouter)
app.use("/dashboard", dashboardRouter)

module.exports = { app }