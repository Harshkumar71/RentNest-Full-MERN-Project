import bcrypt from 'bcryptjs';import jwt from 'jsonwebtoken';import User from '../models/User.js';
const makeToken=id=>jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'7d'});
const safe=u=>({id:u._id,name:u.name,email:u.email,role:u.role,phone:u.phone,avatar:u.avatar});
export const register=async(req,res)=>{try{const {name,email,password,role,phone}=req.body;if(!name||!email||!password)return res.status(400).json({message:'Name, email and password required'});if(await User.findOne({email}))return res.status(409).json({message:'Email already registered'});const user=await User.create({name,email,password:await bcrypt.hash(password,10),role:role==='owner'?'owner':'customer',phone});res.status(201).json({token:makeToken(user._id),user:safe(user)})}catch(e){res.status(400).json({message:e.message})}};
export const login=async(req,res)=>{const {email,password}=req.body;const u=await User.findOne({email});if(!u||!(await bcrypt.compare(password,u.password)))return res.status(401).json({message:'Invalid email or password'});res.json({token:makeToken(u._id),user:safe(u)})};
export const me=(req,res)=>res.json(safe(req.user));
