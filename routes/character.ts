import { Router } from "express";
import { needsToken } from "../strategies/jwt";

const router = Router();

router.use(needsToken);

router.get('/', async (req, res, next) => {
    throw new Error("not implemented");
});

router.get('/list', async (req, res, next) => {
    throw new Error("not implemented");
});

export default router