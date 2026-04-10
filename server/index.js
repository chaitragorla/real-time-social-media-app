import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
const server = createServer(app);
const io = new Server(server);

// DATABASE
const db = await open({
  filename: "chat.db",
  driver: sqlite3.Database,
});

await db.exec(`
CREATE TABLE IF NOT EXISTS messages(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT
);
`);

app.get("/", (req, res) => {
  res.send("🚀 Socket.IO Server Running");
});

// SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("chat message", async (msg) => {
    const result = await db.run(
      "INSERT INTO messages(content) VALUES(?)",
      msg
    );

    io.emit("chat message", msg, result.lastID);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// SERVER START
server.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});