import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

import { verifyTokenCookie } from "../../middlewares/verifyTokenCookie";

const prisma = new PrismaClient();

const authRouter = Router();

const secretKey = process.env.SECRET_KEY as string;

authRouter.post("/auth/login", async (req, res) => {
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
        maxAge: 30 * 1000,
      });

      res.status(200).send({
        message: "Logged in successfully",
        user: { id: user.id, email: user.email, token },
      });
    } else {
      res.status(401).send({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).send("Internal server error");
  }
});

authRouter.post("/auth/logout", verifyTokenCookie, (req, res) => {
  res.clearCookie("token");
  res.send({ message: "Logged out successfully" });
});

authRouter.post("/auth/register", async (req, res) => {
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
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).send("Registered and logged in successfully");
  } catch (error) {
    res.status(500).send("Error registering new user");
  }
});

authRouter.get("/auth/check", verifyTokenCookie, (req, res) => {
  res
    .status(200)
    .send({ message: "success", authenticated: true, user: req.user });
});

export default authRouter;
