import express from "express";
import { issueBook, returnBook, getMyTransactions, getAllTransactions } from "../controllers/transactionController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post("/issue", protect, issueBook);
router.post("/return", protect, returnBook);
router.get("/my-loans", protect, getMyTransactions);
router.get("/", protect, adminOnly, getAllTransactions);

export default router;
