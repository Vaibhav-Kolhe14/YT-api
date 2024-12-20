const { Router } = require('express')
const { verifyJWT } = require('../middlewares/authMiddleware.js')
const {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} = require("../controllers/subscriptionController.js")


const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

module.exports = router