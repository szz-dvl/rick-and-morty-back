import { Router } from "express";
import { needsToken } from "../strategies/jwt";
import { User } from "../models/user";
import { DocumentType } from "@typegoose/typegoose";
import { getIp } from "../utils";
import { StatusCodes } from "../constants";

const router = Router();

router.use(needsToken);

router.post('/favorite', async (req, res, next) => {
    try {

        const { id } = req.body;
        const user = req.user as DocumentType<User>;

        await user
            .pushFav(id)
            .event({

                ip: getIp(req),
                ua: req.headers['user-agent'] || "",
                event: `favorite-${id}`

            }).save();

        res.status(StatusCodes.OK).json({ favorites: user.favs });

    } catch (err) {
        next(err);
    }
});

router.delete('/favorite/:id', async (req, res, next) => {
    try {

        const id  = parseInt(req.params.id, 10);
        const user = req.user as DocumentType<User>;

        await user
            .pullFav(id)
            .event({

                ip: getIp(req),
                ua: req.headers['user-agent'] || "",
                event: `unfavorite-${id}`

            }).save();

        res.status(StatusCodes.OK).json({ favorites: user.favs });

    } catch (err) {
        next(err);
    }
});

router.get('/favorites', async (req, res, next) => {
    try {

        const user = req.user as DocumentType<User>;

        res.status(StatusCodes.OK).json({ favorites: user.favs });

    } catch (err) {
        next(err);
    }
});

export default router
