import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY;

export const verifyTokenHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(403)
      .send({ message: "Authorization header is required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secretKey as string);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send({ message: "Invalid Token" });
  }

  return next();
};
