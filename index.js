// express-books-api/index.js

const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const SECRET_KEY = process.env.JWT_SECRET;

// Sequelize setup
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
  }
);

// Models
const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Book = sequelize.define("Book", {
  title: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  rating: { type: DataTypes.FLOAT, allowNull: false },
  publishedDate: { type: DataTypes.DATEONLY, allowNull: false },
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token missing" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalid" });
    req.user = user;
    next();
  });
}

// User Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashedPassword });
  res.status(201).json({ message: "User registered successfully" });
});

// User Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ error: "User not found" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ error: "Invalid password" });

  const token = jwt.sign({ email: user.email }, SECRET_KEY, {
    expiresIn: "1h",
  });
  res.json({ token });
});

// Create Book
app.post("/books", authenticateToken, async (req, res) => {
  const { title, author, category, price, rating, publishedDate } = req.body;
  if (
    !title ||
    !author ||
    !category ||
    price == null ||
    rating == null ||
    !publishedDate
  ) {
    return res.status(400).json({ error: "Missing book fields" });
  }
  const book = await Book.create({
    title,
    author,
    category,
    price,
    rating,
    publishedDate,
  });
  res.status(201).json(book);
});

// Get All Books with Filtering & Search
app.get("/books", authenticateToken, async (req, res) => {
  const { author, category, rating, title } = req.query;
  const where = {};

  if (author) where.author = author;
  if (category) where.category = category;
  if (rating) where.rating = { [Sequelize.Op.gte]: parseFloat(rating) };
  if (title) where.title = { [Sequelize.Op.iLike]: `%${title}%` };

  const books = await Book.findAll({ where });
  res.json(books);
});

// Get Book by ID
app.get("/books/:id", authenticateToken, async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

// Update Book by ID
app.put("/books/:id", authenticateToken, async (req, res) => {
  const { title, author, category, price, rating, publishedDate } = req.body;
  const book = await Book.findByPk(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });

  await book.update({ title, author, category, price, rating, publishedDate });
  res.json(book);
});

// Delete Book by ID
app.delete("/books/:id", authenticateToken, async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });

  await book.destroy();
  res.json({ message: "Book deleted successfully" });
});

// Catch-all for invalid routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Sync DB and start server
sequelize.sync().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
});
