const express=require("express"),cors=require("cors");
const app=express();app.use(cors());app.use(express.json());
const inventory=process.env.INVENTORY_URL||"http://localhost:5001";
const orders=process.env.ORDER_URL||"http://localhost:5002";
const users=process.env.USER_URL||"http://localhost:5003";
app.get("/",(req,res)=>res.json({message:"CloudStore API Gateway is running",architecture:"microservices"}));
async function forward(base,path,req,res){try{const response=await fetch(base+path,{method:req.method,headers:{"Content-Type":"application/json"},...(req.method==="GET"?{}:{body:JSON.stringify(req.body)})});const text=await response.text();res.status(response.status).type(response.headers.get("content-type")||"application/json").send(text)}catch(e){res.status(503).json({message:"Downstream service unavailable",detail:e.message})}}
app.get("/products",(q,s)=>forward(inventory,"/products",q,s));app.get("/products/:id",(q,s)=>forward(inventory,"/products/"+encodeURIComponent(q.params.id),q,s));app.post("/products",(q,s)=>forward(inventory,"/products",q,s));
app.get("/orders",(q,s)=>forward(orders,"/orders",q,s));app.post("/orders",(q,s)=>forward(orders,"/orders",q,s));
app.get("/users",(q,s)=>forward(users,"/users",q,s));app.post("/users",(q,s)=>forward(users,"/users",q,s));
app.get("/health",async(q,s)=>{const checks={};for(const [k,u] of Object.entries({inventory,orders,users})){try{const r=await fetch(u+"/health");checks[k]=r.ok?"ok":"unhealthy"}catch{checks[k]="unavailable"}}const ok=Object.values(checks).every(x=>x==="ok");s.status(ok?200:503).json({status:ok?"ok":"degraded",services:checks})});
app.listen(Number(process.env.PORT||5000),()=>console.log("CloudStore API Gateway listening on",process.env.PORT||5000));
