import { Request } from "express";

export const getIp = (req: Request) => {
    return (
        req.headers['x-redirector-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress
    ) as string;
}