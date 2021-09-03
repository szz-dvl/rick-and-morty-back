import { Request, Response, NextFunction } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import User from '../models/user';

const JwtStrategy = new Strategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Rick_And_Morty'),
        secretOrKey: process.env.JWT_SECRET
    },
    async function (jwtPayload, done) {
        try {
            const user = await User.findByNick(jwtPayload.sub);

            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err, false);
        }
    }
);

/** Middleware for routes */
export function needsToken (req: Request, res: Response, next: NextFunction) {
    passport.authenticate('jwt', { session: false })(req, res, next);
}

export default JwtStrategy;
