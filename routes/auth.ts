import { Request, Response, NextFunction } from 'express';
import { Router } from "express";
import User from "../models/user";
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions, Algorithm } from 'jsonwebtoken';
import { StatusCodes } from "../constants";
import { getIp } from "../utils";
import { promisify } from "util";

const router = Router();

const generateToken = async (nick: string, req: Request, remember: boolean) => {

  const now = Math.floor(Date.now() / 1000);

  const opts: SignOptions = {
    algorithm: process.env.JWT_ALGO as Algorithm,
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
  }

  if (!remember)
    opts.expiresIn = "1d";

  return await promisify<object, Secret, SignOptions>(jwt.sign)(
    {
      iat: now,
      sub: nick,
      extra: {
        ip: getIp(req),
        agent: req.headers['user-agent']
      },
    },
    process.env.JWT_SECRET as string,
    opts
  );
}

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {

  try {

    const { user: nick, pwd, remember } = req.body;

    if (nick && pwd) {

      const user = await User.findByNick(nick);

      if (user) {

        const match = await bcrypt.compare(pwd, user.password);

        if (match) {

          res.status(StatusCodes.OK).json({
            token: await generateToken(nick, req, remember)
          });

          await user.event({

            ip: getIp(req),
            ua: req.headers['user-agent'] || "",
            event: 'login'

          }).save();

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

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {

  try {

    const { user: nick, pwd: password } = req.body;

    if (nick && password) {

      const user = await User.findByNick(nick);

      if (!user) {

        await new User({

          nick,
          password

        }).create({

          ip: getIp(req),
          ua: req.headers['user-agent'] || ""

        }).save();

        res.status(StatusCodes.CREATED).json({
          state: true
        });

      } else {
        res.status(StatusCodes.FORBIDEN).json({ err: "Bussy nick name." });
      }

    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ err: "Missing data." });
    }

  } catch (err) {
    next(err);
  }

});

export default router
