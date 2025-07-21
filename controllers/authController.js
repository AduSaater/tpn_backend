const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      nin,
      userType,
      address,
      password,
    } = req.body;

    if (
      !["individual", "dealer", "frsc_admin", "enforcement"].includes(userType)
    ) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const existingUser = await User.findByEmail(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingNin = await User.findByNin(nin);
    if (existingNin) {
      return res
        .status(400)
        .json({ message: "User with this NIN already exists" });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      nin,
      userType,
      address,
      password,
    });

    const token = jwt.sign(
      { id: newUser.id, userType: newUser.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.message.includes("users_nin_key")) {
      return res
        .status(400)
        .json({ message: "User with this NIN already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    console.log("Login attempt:", { email, userType });

    const user = await User.findByEmail(email.toLowerCase());
    console.log("User found:", user);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.user_type !== userType) {
      console.log("User type mismatch:", {
        db: user.user_type,
        request: userType,
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      user: { id: user.id, email: user.email, userType: user.user_type },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
