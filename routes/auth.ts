import { Request, Response, NextFunction } from 'express';
import { Router } from "express";
import User from "../models/user";
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions, Algorithm } from 'jsonwebtoken';
import { StatusCodes } from "../constants";
import { getIp } from "../utils";
import { promisify } from "util";

const router = Router();

const aDay = 24 * 60 * 60;

const generateToken = async (nick: string, req: Request, remember: boolean) => {

  const now = Date.now() / 1000;

  return await promisify<object, Secret, SignOptions>(jwt.sign)(
    {
      sub: nick,
      extra: {
        ip: getIp(req),
        agent: req.headers['user-agent']
      },
    },
    process.env.JWT_SECRET as string,
    {
      algorithm: process.env.JWT_ALGO as Algorithm,
      notBefore: now,
      expiresIn: remember ? undefined : now + aDay,
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
    }
  );
}

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {

  try {

    const { user: nick, pwd, remember } = req.body;
    console.log("body: ", req.body);

    if (nick && pwd) {

      const user = await User.findByNick(nick);

      if (user) {

        const match = await bcrypt.compare(pwd, user.password);

        if (match) {

          res.status(StatusCodes.OK).json({
            token: await generateToken(nick, req, remember)
          });

        } else {
          res.status(StatusCodes.UNAUTHORIZED).json({ err: "Bad password provided." });
        }

      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ err: "Bad user provided." });
      }

    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ err: "Missing data." });
    }

  } catch (err) {
    next(err);
  }

});

export default router
