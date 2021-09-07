import { Router } from "express";
import { needsToken } from "../strategies/jwt";
import { getCharacter, getCharacters, getEpisode } from 'rickmortyapi';
import { StatusCodes } from "../constants";
import { User } from "../models/user";
import { getIp } from "../utils";
import { DocumentType } from "@typegoose/typegoose";

const router = Router();

router.use(needsToken);

router.get('/list', async (req, res, next) => {

    try {

        const page = parseInt(req.query.page as string, 10) || 1;
        res.status(StatusCodes.OK).json({ characters: await getCharacters({ page }) });

    } catch (err) {
        next(err);
    }

});

router.get('/episode/:id', async (req, res, next) => {

    try {

        const id = parseInt(req.params.id as string, 10);
        res.status(StatusCodes.OK).json({ episode: await getEpisode(id) });

    } catch (err) {
        next(err);
    }

});

router.get('/:id', async (req, res, next) => {

    try {

        const id = parseInt(req.params.id as string, 10);
        const user = req.user as DocumentType<User>;

        res.status(StatusCodes.OK).json({ character: await getCharacter(id), isFav: user.favs.includes(id) });

        await user
            .event({

                ip: getIp(req),
                ua: req.headers['user-agent'] || "",
                event: `visit-${id}`

            }).save();

    } catch (err) {
        next(err);
    }

});

export default router