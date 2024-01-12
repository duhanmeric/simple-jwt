import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// import authRouterCookie from "./routes/cookie/auth";
// import userRouterCookie from "./routes/cookie/user";

import authRouterHeaders from "./routes/headers/auth";
import userRouterHeaders from "./routes/headers/user";

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const port = process.env.PORT || 3000;

app.use("/api", authRouterHeaders);
app.use("/api", userRouterHeaders);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
