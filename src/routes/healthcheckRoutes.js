const { Router } = require('express')
const { healthcheck } = require("../controllers/healthCheckController.js")
const { healthcheck } = require("../controllers/healthCheckController.js")

const router = Router();

router.route('/').get(healthcheck);

export default router