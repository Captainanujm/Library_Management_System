import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registerUser=async (req,res)=>{
    try{
        const {name,email,password}=req.body;
    if(!name||!email||!password){
        return res.status(400).json({
            success:false,
            message:"all fields are required"
        })
    }
    const userExists=await User.findOne({email});
    if(userExists){
        return res.status(400).json({
            success:false,
            message:"User already exists"
        })
    }
    const hashedPassword=await bcrypt.hash(password,10);
    const finalRole = email === "captainanuj2004@gmail.com" ? "admin" : "user";
    const newUser=await User.create({
        name,
        email,
        password:hashedPassword,
        role: finalRole,
    });
    return res.status(201).json({
        success:true,
        message:"User registered",
        user:{
            name:newUser.name,
            email:newUser.email,
            role:newUser.role,
        }    
    })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
    
}
export const login=async (req,res)=>{
    try{
         const {email,password}=req.body;
    if(!email||!password){
        return res.status(400).json({
            success:false,
            message:"All fields are required"
        })
    }
    const userExists=await User.findOne({email});
    if(!userExists){
        return res.status(400).json({
             success:false,
            message:"User not registered"
        })
    }
    const matchPassword=await bcrypt.compare(password,userExists.password);
    if(!matchPassword){
        return res.status(400).json({
            success:false,
            message:"Email invalid or password invalid"
        })
    }
    if (userExists.email === "captainanuj2004@gmail.com" && userExists.role !== "admin") {
        userExists.role = "admin";
        await userExists.save();
    }
    const token=jwt.sign(
        {
             userId:userExists._id,
            role:userExists.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"7d",
        }

       
    )
    return res.status(200).json({
        success:true,
        message:"User logged in successfully",
        token,
        user:{
            name:userExists.name,
            email:userExists.email,
            role: userExists.role
        }
    })
    }catch(error){
       return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
   
    
}