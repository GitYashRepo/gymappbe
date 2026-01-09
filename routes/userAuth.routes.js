const express = require("express");
const router = express.Router();
const { register, login, profile, addFavoritePod, removeFavoritePod, getFavoritePods } = require("../controllers/userAuth.controller");
const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const User = require("../models/User");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, profile);
router.post("/favorites/:podId", protect, addFavoritePod);
router.delete("/favorites/:podId", protect, removeFavoritePod);
router.get("/favorites", protect, getFavoritePods);
router.put("/profile-image", protect, upload.single("image"),
  async (req, res) => {
    const user = await User.findById(req.user.id)

    user.profileImage = req.file.path
    await user.save()

    res.json({ image: user.profileImage })
  }
)


module.exports = router;
