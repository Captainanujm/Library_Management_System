import express from "express";
import { getBooks, getBookById, addBook, updateBook, deleteBook } from "../controllers/bookController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", protect, getBooks);
router.get("/:id", protect, getBookById);
router.post("/", protect, adminOnly, addBook);
router.put("/:id", protect, adminOnly, updateBook);
router.delete("/:id", protect, adminOnly, deleteBook);

export default router;
