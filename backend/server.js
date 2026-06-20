const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.get("/", (req, res) => {
  res.send("Cloud Task Manager Backend is running.");
});

app.get("/api/tasks", (req, res) => {
  db.all("SELECT * FROM tasks ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json(rows);
  });
});

app.post("/api/tasks", (req, res) => {
  const { title, due_date } = req.body;

  if (!title) {
    res.status(400).json({ error: "Task title is required." });
    return;
  }

  const sql = "INSERT INTO tasks (title, due_date, completed) VALUES (?, ?, ?)";
  const params = [title, due_date || null, 0];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.status(201).json({
      id: this.lastID,
      title: title,
      due_date: due_date || null,
      completed: 0
    });
  });
});

app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  const sql = "UPDATE tasks SET completed = ? WHERE id = ?";

  db.run(sql, [completed ? 1 : 0, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({ message: "Task updated successfully." });
  });
});

app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM tasks WHERE id = ?";

  db.run(sql, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({ message: "Task deleted successfully." });
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});