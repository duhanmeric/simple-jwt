import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

import { verifyTokenHeaders } from "../../middlewares/verifyTokenHeaders";

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
        expiresIn: process.env.TOKEN_TIMEOUT,
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

authRouter.post("/auth/logout", verifyTokenHeaders, (req, res) => {
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
      expiresIn: process.env.TOKEN_TIMEOUT,
    });

    res.status(200).send({
      message: "Registered and logged in successfully",
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

authRouter.get("/auth/check", verifyTokenHeaders, (req, res) => {
  res
    .status(200)
    .send({ message: "success", authenticated: true, user: req.user });
});

export default authRouter;
