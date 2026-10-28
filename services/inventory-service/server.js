const express=require("express"),cors=require("cors"),db=require("./db");
const app=express(); app.use(cors()); app.use(express.json());
app.get("/",(req,res)=>res.json({service:"CloudStore Inventory Service",status:"ok"}));
app.get("/health",async(req,res)=>{try{await db.query("SELECT 1");res.json({status:"ok",database:"connected"})}catch(e){res.status(503).json({status:"error"})}});
app.get("/products",async(req,res)=>{try{const r=await db.query("SELECT * FROM products ORDER BY id");res.json(r.rows)}catch(e){res.status(500).json({error:"Unable to fetch products"})}});
app.post("/products",async(req,res)=>{try{const {name,price,stock}=req.body;if(!name||!Number.isFinite(Number(price))||Number(price)<=0||!Number.isInteger(Number(stock))||Number(stock)<0)return res.status(400).json({message:"Provide name, positive price and non-negative integer stock"});const r=await db.query("INSERT INTO products(name,price,stock) VALUES($1,$2,$3) RETURNING *",[name.trim(),price,stock]);res.status(201).json({message:"Product added successfully",product:r.rows[0]})}catch(e){res.status(500).json({error:"Unable to add product"})}});
app.get("/products/:id",async(req,res)=>{try{const r=await db.query("SELECT * FROM products WHERE id=$1",[req.params.id]);if(!r.rowCount)return res.status(404).json({message:"Product not found"});res.json(r.rows[0])}catch(e){res.status(500).json({error:"Unable to fetch product"})}});
app.listen(Number(process.env.PORT||5000),()=>console.log("Inventory Service listening on",process.env.PORT||5000));
