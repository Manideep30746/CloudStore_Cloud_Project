const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Test API
app.get("/", (req, res) => {
    res.json({
        message: "CloudStore API is running"
    });
});

// Get all products
app.get("/products", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM products ORDER BY id"
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Add product
app.post("/products", async (req, res) => {
    try {
        const { name, price, stock } = req.body;

        const result = await db.query(
            `INSERT INTO products (name, price, stock)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, price, stock]
        );

        res.status(201).json({
            message: "Product added successfully",
            product: result.rows[0]
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Create order
app.post("/orders", async (req, res) => {
    try {
        const { product_id, quantity } = req.body;

        // Find product
        const productResult = await db.query(
            "SELECT * FROM products WHERE id = $1",
            [product_id]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const product = productResult.rows[0];

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        // Calculate total
        const total = Number(product.price) * quantity;

        // Create order
        const orderResult = await db.query(
            `INSERT INTO orders
             (product_id, quantity, total_price)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [product_id, quantity, total]
        );

        // Reduce stock
        await db.query(
            `UPDATE products
             SET stock = stock - $1
             WHERE id = $2`,
            [quantity, product_id]
        );

        res.status(201).json({
            message: "Order created successfully",
            order: orderResult.rows[0],
            totalPrice: total
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Get all orders
app.get("/orders", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                orders.id,
                products.name AS product,
                orders.quantity,
                orders.total_price,
                orders.status
            FROM orders
            JOIN products
            ON orders.product_id = products.id
            ORDER BY orders.id
        `);

        res.json(result.rows);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Start server
app.listen(5000, () => {
    console.log("CloudStore API running on http://localhost:5000");
});