import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import { protect } from "./middlewares/authMiddleware.js";

dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());
const PORT=process.env.PORT||5000;
connectDb();

app.use("/api/auth",authRoutes);
app.use("/api/books",bookRoutes);
app.use("/api/transactions",transactionRoutes);

app.get("/health",protect,(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Api health fetched succesfully",
        user:req.user,
    })
})
app.listen(PORT,()=>{
    console.log(`Server is listening on port ${PORT}`);
})