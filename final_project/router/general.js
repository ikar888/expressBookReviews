const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body; // Extract username and password from the request body

  // Check if both username and password are provided
  if (!username || !password) {
      return res.status(400).json({
          message: "Username and password are required."
      });
  }

  // Check if the username already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
      return res.status(409).json({
          message: `Username '${username}' is already taken. Please choose a different username.`
      });
  }

  // Add the new user to the users array
  users.push({ username, password });

  return res.status(201).json({
      message: "User registered successfully!",
      username: username
  });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn]);
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const authorName = req.params.author; // Extract the author name from request parameters
    const booksArray = Object.values(books); // Get all the book objects in an array

    // Filter books where the author matches the provided author name
    const booksByAuthor = booksArray.filter(book => book.author === authorName);

    if (booksByAuthor.length > 0) {
        res.status(200).json({
            books: booksByAuthor
        });
    } 
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const bookTitle = req.params.title; // Extract the title from request parameters
  const booksArray = Object.values(books); // Get all the book objects in an array

  // Find the book where the title matches the provided title
  const bookByTitle = booksArray.find(book => book.title === bookTitle);

  if (bookByTitle) {
      res.status(200).json({
          book: bookByTitle
      });
  } 
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn; // Extract the ISBN from request parameters
  const book = books[isbn]; // Retrieve the book details using the ISBN as key

  if (book && book.reviews) {
      res.status(200).json({
          message: "Reviews found for the book.",
          reviews: book.reviews
      });
  } else {
      res.status(404).json({
          message: `No reviews found for the book with ISBN: ${isbn}.`
      });
  }
});

module.exports.general = public_users;
