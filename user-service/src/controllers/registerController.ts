import {  Request, Response } from 'express';



const register=(req:Request,res:Response)=>{
    const {email,password,name}=req.body;

if (!email || !password || !name) {
    res.status(400).json({ error: 'email, password and name are required' });
    return;
  }
  
  res.status(201).json({message:'User Register', User:{email,password,name} })

}



export default {register}