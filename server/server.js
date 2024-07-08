const express = require("express");
require("dotenv").config(); // To access the environment variables
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
const cors = require("cors");

const connectDB = require("./config/dbconfig");
const userRouter = require("./routes/userRoute");
const movieRouter = require("./routes/movieRoute");
const theatreRouter = require("./routes/theatreRoute");
const showRouter = require("./routes/showRoute");
const bookingRouter = require("./routes/bookingRoute");

const app = express();

// Enable CORS
app.use(
  cors({
    origin: "*", // Allow all origins, you can restrict it to specific origins if needed
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Security middlewares
app.use(helmet());
app.disable("x-powered-by"); // it will remove the x-powered-by header from the response

// Parse request bodies as JSON
app.use(express.json());
app.use("/api/bookings/verify", express.raw({ type: "application/json" }));

// Connect to the database
connectDB();

// Rate limiter middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Apply rate limiter to all API routes
app.use("/api/", apiLimiter);

// Sanitize user input to prevent MongoDB Operator Injection
app.use(mongoSanitize());

// Serve static files
const clientBuildPath = path.join(__dirname, "../client/build");
console.log(`Serving static files from: ${clientBuildPath}`);
app.use(express.static(clientBuildPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

/** Routes */
app.use("/api/users", userRouter);
app.use("/api/movies", movieRouter);
app.use("/api/theatres", theatreRouter);
app.use("/api/shows", showRouter);
app.use("/api/bookings", bookingRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
