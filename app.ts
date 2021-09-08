import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import logger from 'morgan';

import character from "./routes/character";
import auth from "./routes/auth";
import user from "./routes/user";
import passport from 'passport';
import cors from 'cors';
import JwtStrategy from './strategies/jwt';
import mongoose from 'mongoose';
import { StatusCodes } from "./constants";

passport.use(JwtStrategy);

export const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(cookieParser());
app.use(cors());

app.use('/user', user);
app.use('/auth', auth);
app.use('/character', character);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {

    /**
     * I'm logging to console, but anything goes here: mails, Logstash, Sentry, etc, etc ...
     */
    console.error(err.stack);
    res.status(StatusCodes.SERVER_ERROR).json({ err: "Internal Server Error" });
});

mongoose.connect(
    `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }
);
