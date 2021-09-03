import { Router } from "express";
import { needsToken } from "../strategies/jwt";

const router = Router();

router.use(needsToken);

router.post('/favorite', async (req, res, next) => {
    throw new Error("not implemented");
});

router.delete('/favorite', async (req, res, next) => {
    throw new Error("not implemented");
});

export default router
