const { Router } = require('express')
const { verifyJWT } = require('../middlewares/authMiddleware.js')
const {
    getChannelStats, 
    getChannelVideos
} = require("../controllers/dashboardController.js")


const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

module.exports = router