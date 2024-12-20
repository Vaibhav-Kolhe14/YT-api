const { Router } = require('express')
const { verifyJWT } = require('../middlewares/authMiddleware.js')
const {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
} = require("../controllers/commentController.js")


const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

module.exports = router