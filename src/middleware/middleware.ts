import { NextFunction, Request, Response } from "express";
import { userRegistrationSchema } from "../validation/zod";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";

const prisma = new PrismaClient();

// Extend Request interface to include token property
declare global {
    namespace Express {
        interface Request {
            token?: string;
            phoneNumber?: string
        }
    }
}

// Middleware to check if user with given phone number already exists
export const checkExistingUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = userRegistrationSchema.parse(req.body);
        const existingUser = await prisma.user.findUnique({
            where: {
                phoneNumber: userData.phoneNumber,
            },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this phone number already exists.' });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Middleware to verify and decode JWT token
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing.' });
    }
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token not provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { phoneNumber: string };
        req.phoneNumber = decoded.phoneNumber;
        next();
    } catch (error) {
        console.error(error);
        return res.status(403).json({ error: 'Invalid token.' });
    }
};
