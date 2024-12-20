const { Router } = require('express')
const { verifyJWT } = require('../middlewares/authMiddleware.js')
const {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} = require("../controllers/tweetController.js")



const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

module.exports = router