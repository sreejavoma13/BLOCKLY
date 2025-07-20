import express from 'express';
import dotenv from "dotenv"
import authRoutes from './routes/auth.route.js'
import pageRoutes from './routes/pages.route.js'
import userRoutes from './routes/user.route.js'
import trashRoutes from './routes/trash.routes.js'
import shareRoutes from './routes/share.js'
import checkRoutes from './routes/check.route.js'
import coPagesRoutes from './routes/copages.route.js'
import cookieParser from "cookie-parser";
import {Server} from 'socket.io'
import http from 'http'
import * as Y from 'yjs';
import axios from "axios";
import cors from "cors";
import bodyParser from "body-parser";

const app=express()
app.use(bodyParser.json());
dotenv.config();
const PORT=process.env.PORT||5000
const server = http.createServer(app);
import {
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
  Awareness
} from 'y-protocols/awareness';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY||"AIzaSyDn0e6fmr3K9QMftMpTthKpUnst7G88xEs";
const GEMINI_API_URL =  `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

app.use(cors({
    origin: "http://localhost:5173", // React frontend
    credentials: true               // Allow cookies if needed
}));

app.use(express.json())
app.use(cookieParser());

app.use("/api/auth",authRoutes)
app.use("/api/pages",pageRoutes)
app.use("/api/user",userRoutes)
app.use("/api/trash", trashRoutes);
app.use("/api/share", shareRoutes);
app.use("/api",checkRoutes)
app.use("/api",coPagesRoutes)

app.post("/gemini", async (req, res) => {
  try {
    const { question } = req.body;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: question,
            },
          ],
        },
      ],
    };

    const response = await axios.post(GEMINI_API_URL, payload);

    res.json(response.data);
  } catch (error) {
    console.error(
      "❌ Error calling Gemini API:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Internal Server Error",
    });
  }
});

const codeStorage = {};
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // or specify your frontend URL like "http://localhost:3000"
    methods: ["GET", "POST"]
  }
});
// Socket.io setup
const awarenessMap = new Map();

io.on('connection', (socket) => {
  const room = socket.handshake.query.room || 'default-room';
  console.log(`✅ Client connected to room: ${room}`);
  socket.join(room);

  // Create Awareness + Y.Doc per room if missing
  if (!awarenessMap.has(room)) {
    const ydoc = new Y.Doc();
    const awareness = new Awareness(ydoc);
    awarenessMap.set(room, { awareness, ydoc });
  }

  const { awareness } = awarenessMap.get(room);

  // 📝 Process incoming awareness updates
  socket.on('awareness', (update) => {
    try {
      const uint8 = new Uint8Array(update);
      applyAwarenessUpdate(awareness, uint8, socket.id);

      // Broadcast awareness update to others
      socket.to(room).emit('awareness', update);
    } catch (err) {
      console.error('❌ Failed to process awareness update:', err);
    }
  });

  // 🔄 Sync document updates
  socket.on('update', (update) => {
    try {
      if (update && update.length > 0) {
        socket.to(room).emit('update', update);
      } else {
        console.warn('⚠️ Received empty or invalid update, skipping.');
      }
    } catch (err) {
      console.error('❌ Failed to process update:', err);
    }
  });

  // 🧹 Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected from room: ${room}`);
    const clientId = socket.id;

    if (awareness.getStates().has(clientId)) {
      awareness.removeStates([clientId]);

      // Send cleanup update
      const cleanupUpdate = encodeAwarenessUpdate(awareness, [clientId]);
      socket.to(room).emit('awareness', cleanupUpdate);
    }

    // Optionally delete room if no awareness states remain
    if (awareness.getStates().size === 0) {
      awarenessMap.delete(room);
    }
  });
});



server.listen(PORT,()=>{
    console.log("server is running on port:",PORT);
});

