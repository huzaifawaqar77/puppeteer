const express = require("express");
const router = express.Router();
const { sendEmail } = require("../controllers/supportController");
const { verifyToken } = require("../middleware/auth");

router.post("/send-email", verifyToken, sendEmail);

module.exports = router;
