const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  const { firstname, lastname, email, password, phone } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    // 🔥 HANDLE DUPLICATE KEY ERROR
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    console.error("Register error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PROFILE
exports.profile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json(user);
};


// ADD POD TO FAVORITES
exports.addFavoritePod = async (req, res) => {
  try {
    const { podId } = req.params;
    const user = await User.findById(req.user.id);

    const alreadyFavorite = user.favoritePods.some(
      (id) => id.toString() === podId
    );

    if (!alreadyFavorite) {
      user.favoritePods.push(podId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Pod added to favorites",
      favoritePods: user.favoritePods,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// REMOVE POD FROM FAVORITES
exports.removeFavoritePod = async (req, res) => {
  try {
    const { podId } = req.params;
    const user = await User.findById(req.user.id);

    user.favoritePods = user.favoritePods.filter(
      (id) => id.toString() !== podId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Pod removed from favorites",
      favoritePods: user.favoritePods,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET FAVORITE PODS
exports.getFavoritePods = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "favoritePods",
        match: { isActive: true }, // optional
      });

    res.status(200).json({
      success: true,
      data: user.favoritePods,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
