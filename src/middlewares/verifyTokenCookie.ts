import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY;

export const verifyTokenCookie = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(403)
      .send({ message: "A token is required for authentication" });
  }

  try {
    const decoded = jwt.verify(token, secretKey as string);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send({ message: "Invalid Token" });
  }

  return next();
};
