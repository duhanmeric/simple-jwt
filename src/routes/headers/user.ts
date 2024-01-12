import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import { verifyTokenHeaders } from "../../middlewares/verifyTokenHeaders";

const userRouter = Router();

const prisma = new PrismaClient();

userRouter.get("/user", verifyTokenHeaders, async (req, res) => {
  try {
    if (req.user) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });

      if (user) {
        res.status(200).send({ user: { id: user.id, email: user.email } });
      } else {
        res.status(404).send({ message: "User not found" });
      }
    }
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

export default userRouter;
