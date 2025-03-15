const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
 // Filter the users array for any user with the same username and password
 let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
});
// Return true if any valid user is found, otherwise false
if (validusers.length > 0) {
    return true;
} else {
    return false;
}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 120 * 120 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Extract the ISBN from the route parameters
    const review = req.query.review; // Extract the review from the query parameters
    const username = req.session.authorization?.username; // Retrieve the username from the session

    if (!review) {
        return res.status(400).json({ message: "Review content is missing" }); // Validate review existence
    }

    if (!username) {
        return res.status(403).json({ message: "User not logged in" }); // Validate user's login status
    }

    // Assuming `books` is your data store for book information
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book with the given ISBN not found" }); // Validate book existence
    }

    const book = books[isbn];
    book.reviews = book.reviews || {}; // Ensure the reviews structure exists for the book

    if (book.reviews[username]) {
        // Modify the existing review for the same user
        book.reviews[username] = review;
        return res.status(200).json({ message: "Review updated successfully", reviews: book.reviews });
    } else {
        // Add a new review for a different user
        book.reviews[username] = review;
        return res.status(200).json({ message: "Review added successfully", reviews: book.reviews });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Retrieve the ISBN from the URL parameters
    const username = req.session.authorization?.username; // Retrieve the username from the session

    if (!username) {
        return res.status(403).json({ message: "User not logged in" }); // Validate user's login status
    }

    // Assuming `books` is your data store for book information
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book with the given ISBN not found" }); // Validate book existence
    }

    const book = books[isbn];
    const reviews = book.reviews || {}; // Fetch the reviews for the book

    if (!reviews[username]) {
        return res.status(404).json({ message: "No review found for this user." }); // No review to delete for this user
    }

    // Delete the user's review
    delete reviews[username];

    // If no reviews are left, clean up the reviews object
    if (Object.keys(reviews).length === 0) {
        delete book.reviews;
    }

    return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews || {} });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
