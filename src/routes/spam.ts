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

        let existingSpam = await prisma.spam.findFirst({
            where: {
                phoneNumber
            }
        });

        if (existingSpam) {
            const totalSpamCount = await prisma.spam.count();
            const phoneNumberSpamCount = await prisma.spam.count({
                where: {
                    phoneNumber
                }
            });
            const likelihood = totalSpamCount > 0 ? phoneNumberSpamCount / totalSpamCount : 0;
            existingSpam = await prisma.spam.update({
                where: {
                    id: existingSpam.id,
                },
                data: {
                    likelihood: likelihood,
                },
            });

            res.json(existingSpam);
        } else {
            const totalSpamCount = await prisma.spam.count();
            const likelihood = totalSpamCount > 0 ? 1 / totalSpamCount : 1;
            const userSpam = await prisma.user.findFirst({
                where: {
                    phoneNumber: req.phoneNumber
                }
            })
            await prisma.spam.create({
                data: {
                    phoneNumber,
                    likelihood,
                    userId: userSpam?.id
                },
            });

            res.status(201).json({ message: 'Number marked as spam successfully' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
})