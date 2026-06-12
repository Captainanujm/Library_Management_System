import Transaction from "../models/Transaction.js";
import Book from "../models/Book.js";
import User from "../models/User.js";

export const issueBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        const studentId = req.user.userId;

        if (!bookId) {
            return res.status(400).json({
                success: false,
                message: "Book ID is required"
            });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        if (book.availableCopies <= 0) {
            return res.status(400).json({
                success: false,
                message: "No copies of this book are currently available"
            });
        }

        const existingIssue = await Transaction.findOne({
            bookId,
            studentId,
            status: "issued"
        });

        if (existingIssue) {
            return res.status(400).json({
                success: false,
                message: "You have already issued a copy of this book and have not returned it yet"
            });
        }

        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        const transaction = await Transaction.create({
            bookId,
            studentId,
            issueDate,
            dueDate,
            status: "issued"
        });

        book.availableCopies -= 1;
        await book.save();

        return res.status(201).json({
            success: true,
            message: "Book issued successfully",
            transaction
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error issuing book",
            error: error.message
        });
    }
};

export const returnBook = async (req, res) => {
    try {
        const { transactionId } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: "Transaction ID is required"
            });
        }

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        if (transaction.status === "returned") {
            return res.status(400).json({
                success: false,
                message: "This book has already been returned"
            });
        }

        if (userRole !== "admin" && transaction.studentId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only return books that you have issued"
            });
        }

        const book = await Book.findById(transaction.bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book associated with this transaction not found"
            });
        }

        const returnDate = new Date();
        
        let fine = 0;
        const timeDiff = returnDate.getTime() - transaction.dueDate.getTime();
        if (timeDiff > 0) {
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            fine = daysDiff * 5;
        }

        transaction.returnDate = returnDate;
        transaction.fine = fine;
        transaction.status = "returned";
        await transaction.save();

        book.availableCopies += 1;
        await book.save();

        return res.status(200).json({
            success: true,
            message: fine > 0 
                ? `Book returned successfully. Late return fine of ₹${fine} calculated.` 
                : "Book returned successfully with zero fine.",
            transaction
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error returning book",
            error: error.message
        });
    }
};

export const getMyTransactions = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const transactions = await Transaction.find({ studentId })
            .populate("bookId", "title author genre isbn")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            transactions
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching loan history",
            error: error.message
        });
    }
};

export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate("bookId", "title author genre isbn")
            .populate("studentId", "name email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            transactions
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching transaction logs",
            error: error.message
        });
    }
};
