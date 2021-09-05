import { Router } from "express";
import { needsToken } from "../strategies/jwt";
import { getCharacters } from 'rickmortyapi'
import { StatusCodes } from "../constants";

const router = Router();

router.use(needsToken);

router.get('/', async (req, res, next) => {
    throw new Error("not implemented");
});

router.get('/list', async (req, res, next) => {

    try {

        const page = parseInt(req.query.page as string, 10) || 1;
        res.status(StatusCodes.OK).json({ characters: await getCharacters({ page }) });

    } catch(err) {
        next(err);
    }

});

export default router