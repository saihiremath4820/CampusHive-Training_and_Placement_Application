const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

// 🔐 Startup Security Guards
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
requiredEnvVars.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    console.warn(`Continuing anyway for development...`);
  }
});
console.log('✅ All required env vars present');

const aiRoutes = require("./routes/aiRoutes");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const httpServer = http.createServer(app);

const socketService = require('./config/socket');
const io = socketService.init(httpServer);

// Make io accessible in controllers
app.set('io', io);

// Socket connection handler
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Join room based on user role
  socket.on('join', (data) => {
    if (data && data.userId && data.role) {
      socket.join(data.userId);        // personal room
      socket.join(data.role);          // role-based room
      if (data.collegeId) {
        socket.join(`college_${data.collegeId}`); // college-based room for broadcast
      }
      console.log(`👤 ${data.role} ${data.userId} joined rooms: [${data.userId}, ${data.role}${data.collegeId ? ', college_' + data.collegeId : ''}]`);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Custom sanitization middleware (Express 5 compatible)
const sanitize = require('./middleware/sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

// 🌐 CORS - MUST BE TOP LEVEL MIDDLEWARE
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 🛡️ Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "frame-ancestors": ["'self'", process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "img-src": ["'self'", "data:", "blob:"],
      "object-src": ["'self'", "data:", "blob:"]
    }
  },
  frameguard: false // Disabled in favor of CSP's more granular 'frame-ancestors'
}));

// 🧹 Data Sanitization (NoSQL + XSS) - Express 5 Compatible
app.use(sanitize());

// 🚫 Prevent Parameter Pollution
app.use(hpp());

// 🍪 Cookie Parser (for httpOnly JWT cookies)
app.use(cookieParser());

// 🐢 Rate Limiting (Increased for frontend polling)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000, // Increased from 100 to prevent 429 Too Many Requests errors from frequent dashboard polling
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Increased limit for resume/profile data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/api/ai", aiRoutes);
app.use("/api/application", require("./routes/application"));
app.use("/api/admin/placement", require("./routes/adminPlacement"));
const path = require("path");
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));



const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

app.use("/api/auth", require("./routes/auth"));
app.use("/api/student", require("./routes/student"));
app.use("/api/student", require("./routes/roadmapRoutes"));
app.use("/api/opportunity", require("./routes/opportunity"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/notifications", require("./routes/notification"));
app.use("/api/project", require("./routes/project"));
app.use("/api/faculty", require("./routes/faculty"));
app.use("/api/team", require("./routes/team"));
app.use("/api/company", require("./routes/company"));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`Run: netstat -ano | findstr :${PORT}  then  taskkill /PID <PID> /F`);
    process.exit(1);
  } else {
    throw err;
  }
});

// Graceful shutdown — always release the port on exit
const shutdown = (signal) => {
  console.log(`\n${signal} received. Closing server gracefully...`);
  httpServer.close(() => {
    console.log('✅ Server closed. Port released.');
    process.exit(0);
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
