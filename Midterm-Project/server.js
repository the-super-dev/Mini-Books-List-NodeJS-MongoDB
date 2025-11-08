const express = require("express"); // Web framework
const mongoose = require("mongoose"); // For MongoDB connection
const path = require("path"); // For handling file and directory paths 
const multer = require("multer"); // For handling file uploads
const Book = require("./models/book"); // Book model

const app = express();

// Connect MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/bookdb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Routes
app.get("/", async (req, res) => {
  const books = await Book.find().limit(3);
  res.status(200).render("home", { books });
});

app.get("/books", async (req, res) => {
  const books = await Book.find();
  res.status(200).render("books", { books });
});

app.get("/add", (req, res) => {
  res
    .status(200)
    .render("form", { book: {}, action: "/add", button: "Add Book" });
});

app.post("/add", upload.single("image"), async (req, res) => {
  try {
    const newBook = {
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      image: req.file ? req.file.filename : "",
    };
    await Book.create(newBook);
    res.status(201).redirect("/books");
  } catch (err) {
    res.status(400).send("❌ Error adding book");
  }
});

app.get("/edit/:id", async (req, res) => {
  const book = await Book.findById(req.params.id);
  res
    .status(200)
    .render("form", {
      book,
      action: `/edit/${book._id}`,
      button: "Update Book",
    });
});

app.post("/edit/:id", upload.single("image"), async (req, res) => {
  try {
    const updatedData = {
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
    };
    if (req.file) updatedData.image = req.file.filename;
    await Book.findByIdAndUpdate(req.params.id, updatedData);
    res.status(200).redirect("/books");
  } catch (err) {
    res.status(400).send("❌ Error updating book");
  }
});

app.get("/delete/:id", async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.status(200).redirect("/books");
  } catch (err) {
    res.status(400).send("❌ Error deleting book");
  }
});

// Privacy Policy
app.get("/privacy", (_req, res) => {
  res.status(200).render("privacy");
});

// Terms of Service
app.get("/term", (_req, res) => {
  res.status(200).render("term");
});

// Contact Us
app.get("/contact", (_req, res) => {
  res.status(200).render("contact");
});

// 404 handler
app.use((req, res) => res.status(404).send("Page not found"));

app.listen(3000, () =>
  console.log("🌐 Server running on http://localhost:3000")
);
