import User     from "../models/User.js";
import Document from "../models/Document.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const newUser = await User.create({ username, email, password });

    await Document.create({
      id: `demo-${newUser._id}`,
      userId: newUser._id.toString(),
      name: "demo_sales_data.csv",
      type: "CSV",
      size: "1.5 KB",
      extractedText: `Month,Revenue,Sales,Orders
January,45000,120,95
February,48000,130,105
March,52000,148,115
April,49000,135,110
May,55000,160,130
June,58000,175,140
July,62000,190,150`,
      stats: {},
    });

    res.status(201).json({ id: newUser._id, username: newUser.username, email: newUser.email });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let foundUser = await User.findOne({ email, password });

    if (!foundUser && email === "demo@example.com" && password === "password") {
      foundUser = await User.create({ username: "DemoUser", email: "demo@example.com", password: "password" });

      await Document.create({
        id: `demo-${foundUser._id}`,
        userId: foundUser._id.toString(),
        name: "demo_sales_data.csv",
        type: "CSV",
        size: "1.5 KB",
        extractedText: `Month,Revenue,Sales,Orders
January,45000,120,95
February,48000,130,105
March,52000,148,115
April,49000,135,110
May,55000,160,130
June,58000,175,140
July,62000,190,150`,
        stats: {},
      });
    }

    if (foundUser) {
      res.json({ id: foundUser._id, username: foundUser.username, email: foundUser.email });
    } else {
      res.status(401).json({ error: "Invalid email or password. Use demo@example.com / password to test." });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
};
