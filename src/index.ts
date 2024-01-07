import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import cookieParser from "cookie-parser";

import { verifyToken } from "./middleware";

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
const secretKey = process.env.SECRET_KEY as string;

const prisma = new PrismaClient();

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/about", verifyToken, async (req: Request, res: Response) => {
  res.status(200).send({ message: "About is protected" });
});

app.get("/auth/check", verifyToken, (req, res) => {
  res.status(200).send({ message: "success", authenticated: true });
});

app.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user.id }, secretKey, {
        expiresIn: "1m",
      });

      res.cookie("token", token, {
        httpOnly: true,
        // maxAge: 24 * 60 * 60 * 1000, // 24 hours
        maxAge: 30 * 1000,
      });

      res.status(200).send({
        message: "Logged in successfully",
        user: { id: user.id, email: user.email },
      });
    } else {
      res.status(401).send({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).send("Internal server error");
  }
});

app.post("/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.send({ message: "Logged out successfully" });
});

app.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ userId: user.id }, secretKey, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // use in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).send("Registered and logged in successfully");
  } catch (error) {
    res.status(500).send("Error registering new user");
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
