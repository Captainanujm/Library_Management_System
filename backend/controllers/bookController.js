import Book from "../models/Book.js";
import Transaction from "../models/Transaction.js";

export const getBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            books
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching books",
            error: error.message
        });
    }
};

export const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }
        return res.status(200).json({
            success: true,
            book
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching book",
            error: error.message
        });
    }
};

export const addBook = async (req, res) => {
    try {
        const { title, author, genre, isbn, totalCopies, image } = req.body;

        if (!title || !author || !genre || !isbn || totalCopies === undefined) {
            return res.status(400).json({
                success: false,
                message: "All fields (title, author, genre, isbn, totalCopies) are required"
            });
        }

        const isbnExists = await Book.findOne({ isbn });
        if (isbnExists) {
            return res.status(400).json({
                success: false,
                message: "Book with this ISBN already exists"
            });
        }

        const copies = parseInt(totalCopies, 10);
        if (isNaN(copies) || copies < 0) {
            return res.status(400).json({
                success: false,
                message: "Total copies must be a non-negative number"
            });
        }

        const newBook = await Book.create({
            title,
            author,
            genre,
            isbn,
            totalCopies: copies,
            availableCopies: copies,
            image
        });

        return res.status(201).json({
            success: true,
            message: "Book added successfully",
            book: newBook
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error adding book",
            error: error.message
        });
    }
};

export const updateBook = async (req, res) => {
    try {
        const { title, author, genre, isbn, totalCopies, image } = req.body;
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        if (isbn && isbn !== book.isbn) {
            const isbnExists = await Book.findOne({ isbn });
            if (isbnExists) {
                return res.status(400).json({
                    success: false,
                    message: "Book with this ISBN already exists"
                });
            }
            book.isbn = isbn;
        }

        if (title) book.title = title;
        if (author) book.author = author;
        if (genre) book.genre = genre;
        if (image !== undefined) book.image = image;

        if (totalCopies !== undefined) {
            const newTotal = parseInt(totalCopies, 10);
            if (isNaN(newTotal) || newTotal < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Total copies must be a non-negative number"
                });
            }

            const activeIssuesCount = book.totalCopies - book.availableCopies;
            if (newTotal < activeIssuesCount) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot reduce total copies below the number of currently checked-out copies (${activeIssuesCount} copies are currently issued)`
                });
            }

            const diff = newTotal - book.totalCopies;
            book.totalCopies = newTotal;
            book.availableCopies = book.availableCopies + diff;
        }

        const updatedBook = await book.save();
        return res.status(200).json({
            success: true,
            message: "Book updated successfully",
            book: updatedBook
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating book",
            error: error.message
        });
    }
};

export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const activeLoans = await Transaction.findOne({ bookId: book._id, status: "issued" });
        if (activeLoans) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete book: There are active loans (some copies are currently issued to students)"
            });
        }

        await Book.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Book deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting book",
            error: error.message
        });
    }
};
