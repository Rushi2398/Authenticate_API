import express, { Request, Response } from "express";
import { verifyToken } from "../middleware/middleware";
import { PrismaClient } from "@prisma/client";
import { markSpamSchema } from "../validation/zod";

export const spamRouter = express.Router();
const prisma = new PrismaClient();

// Endpoint for marking phoneNumbers as spam
spamRouter.post('/spam', verifyToken, async (req: Request, res: Response) => {
    try {
        const { phoneNumber } = markSpamSchema.parse(req.body);
        const existingSpam = await prisma.spam.findFirst({
            where: {
                phoneNumber
            },
        });

        if (existingSpam) {
            return res.status(400).json({ message: 'Number already marked as spam' });
        }
        await prisma.spam.create({
            data: {
                phoneNumber
            },
        });

        res.status(201).json({ message: 'Number marked as spam successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
})