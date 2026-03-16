import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("REST API is running");
});


app.get("/api/v1/tickets", async (req, res) => {

  const { status } = req.query;

  try {

    let result;

    if (status) {
      result = await pool.query(
        "SELECT * FROM tickets WHERE status = $1",
        [status]
      );
    } else {
      result = await pool.query("SELECT * FROM tickets");
    }

    res.json(result.rows);

  } catch (error) {
    console.error("GET error:", error);
    res.status(500).json({ error: error.message });
  }

});

/*
-------------------------------------------------
POST - Add a new ticket
-------------------------------------------------
*/
app.post("/api/v1/tickets", async (req, res) => {

  const { title, status, priority } = req.body;

  try {

    const result = await pool.query(
      "INSERT INTO tickets (title, status, priority) VALUES ($1,$2,$3) RETURNING *",
      [title, status, priority]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("POST error:", error);
    res.status(500).json({ error: error.message });
  }

});


app.put("/api/v1/tickets/:id", async (req, res) => {

  const { id } = req.params;
  const { title, status, priority } = req.body;

  try {

    const result = await pool.query(
      "UPDATE tickets SET title=$1, status=$2, priority=$3 WHERE id=$4 RETURNING *",
      [title, status, priority, id]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("PUT error:", error);
    res.status(500).json({ error: error.message });
  }

});


app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tickets");
    res.json(result.rows);
  } catch (error) {
    console.error("DB test error:", error);
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});