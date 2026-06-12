import express from "express";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();
export const protect=async (req,res,next)=>{
    try{
        const token=req.headers.authorization.split(" ")[1];
    if(!token){
        return res.status(400).json({
            success:false,
            message:"Unauthorized",
        })
    }
    const decoded=await jwt.verify(token,process.env.JWT_SECRET);
    req.user=decoded;
    next();
    }catch(error){
           return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    }
    

}