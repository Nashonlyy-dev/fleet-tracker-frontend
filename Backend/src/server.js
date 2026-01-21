import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import app from "./app.js";

import { saveLocation } from "./services/locationService.js";

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// 1. Create HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // In production, replace with your frontend URL
    methods: ["GET", "POST"],
  },
});



// 3. Socket.io Event Handling
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Listen for driver location updates
  socket.on("update-location", async (data) => {
    try {
      await saveLocation(data.driverId, data.coordinates);
      socket.broadcast.emit("location-received", data);
    } catch (error) {
      console.error("Error saving location:", error);
    }
    // Broadcast location to all other connected clients (Dispatchers)
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// 4. Database Connection & Server Start
const startServer = async () => {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI is missing in .env file");

    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
    process.exit(1); // Stop the server if DB fails
  }
};

startServer();


