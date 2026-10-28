const express=require("express"),cors=require("cors"),db=require("./db");
const app=express(); app.use(cors()); app.use(express.json());
app.get("/",(req,res)=>res.json({service:"CloudStore Order Service",status:"ok"}));
app.get("/health",async(req,res)=>{try{await db.query("SELECT 1");res.json({status:"ok",database:"connected"})}catch(e){res.status(503).json({status:"error"})}});
app.get("/orders", async (req, res) => {
  try {
    const r = await db.query(`
      SELECT o.id, o.product_id, p.name AS product,
             o.quantity, o.total_price, o.created_at
      FROM orders o
      JOIN products p ON p.id = o.product_id
      ORDER BY o.id
    `);
    res.json(r.rows);
  } catch (e) {
    console.error("Failed to fetch orders:", e.message);
    res.status(500).json({ error: "Unable to fetch orders" });
  }
});
app.post("/orders",async(req,res)=>{const {product_id,quantity}=req.body;const q=Number(quantity),pid=Number(product_id);if(!Number.isInteger(pid)||pid<1||!Number.isInteger(q)||q<1)return res.status(400).json({message:"product_id and positive integer quantity are required"});const client=await db.connect();try{await client.query("BEGIN");const pr=await client.query("SELECT * FROM products WHERE id=$1 FOR UPDATE",[pid]);if(!pr.rowCount){await client.query("ROLLBACK");return res.status(404).json({message:"Product not found"})}const p=pr.rows[0];if(Number(p.stock)<q){await client.query("ROLLBACK");return res.status(400).json({message:"Insufficient stock"})}const total=Number(p.price)*q;const order=await client.query("INSERT INTO orders(product_id,quantity,total_price) VALUES($1,$2,$3) RETURNING *",[pid,q,total]);await client.query("UPDATE products SET stock=stock-$1 WHERE id=$2",[q,pid]);await client.query("COMMIT");res.status(201).json({message:"Order created successfully",order:order.rows[0],totalPrice:total})}catch(e){await client.query("ROLLBACK");res.status(500).json({error:"Unable to create order"})}finally{client.release()}});
app.listen(Number(process.env.PORT||5000),()=>console.log("Order Service listening on",process.env.PORT||5000));
