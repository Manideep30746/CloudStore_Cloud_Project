const express=require("express"),cors=require("cors"),db=require("./db");
const app=express();app.use(cors());app.use(express.json());
app.get("/",(req,res)=>res.json({service:"CloudStore User Service",status:"ok"}));
app.get("/health",async(req,res)=>{try{await db.query("SELECT 1");res.json({status:"ok",database:"connected"})}catch(e){res.status(503).json({status:"error"})}});
app.get("/users",async(req,res)=>{try{const r=await db.query("SELECT id,name,email,created_at FROM users ORDER BY id");res.json(r.rows)}catch(e){if(e.code==="42P01")return res.json([]);res.status(500).json({error:"Unable to fetch users"})}});
app.post("/users",async(req,res)=>{const {name,email}=req.body;if(!name||!email||!String(email).includes("@"))return res.status(400).json({message:"Valid name and email are required"});try{const r=await db.query("INSERT INTO users(name,email) VALUES($1,$2) RETURNING id,name,email,created_at",[String(name).trim(),String(email).trim().toLowerCase()]);res.status(201).json({message:"User created",user:r.rows[0]})}catch(e){if(e.code==="42P01")return res.status(503).json({message:"Users table is not initialized yet"});if(e.code==="23505")return res.status(409).json({message:"Email already exists"});res.status(500).json({error:"Unable to create user"})}});
app.listen(Number(process.env.PORT||5000),()=>console.log("User Service listening on",process.env.PORT||5000));
