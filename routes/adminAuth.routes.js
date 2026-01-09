const express = require("express");
const router = express.Router();
const { loginAdmin } = require("../controllers/adminAuth.controller");
const { createAdmin } = require("../controllers/adminAuth.controller")


router.get("/create-admin", createAdmin);
router.post("/login", loginAdmin);

module.exports = router;
