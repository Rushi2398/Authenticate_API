import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/middleware';

export const searchRouter = express.Router();

const prisma = new PrismaClient();

// Function to calculate spam likelihood based on the given phoneNumber
const calculateSpamLikelihood = async (phoneNumber: string) => {
    try {
        // Find the spam record by phoneNumber
        const spamRecord = await prisma.spam.findFirst({
            where: { phoneNumber },
        });
        return spamRecord ? spamRecord.likelihood : 0;
    } catch (error) {
        console.error('Error calculating spam likelihood:', error);
        return 0;
    }
};

// Endpoint to search for a person by name
searchRouter.get('/search/name/:name', verifyToken, async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        // Search for users whose names start with the search query
        const startsWithNameUser = await prisma.user.findMany({
            where: {
                name: {
                    startsWith: name,
                },
            },
        });

        const startsWithNameContacts = await prisma.contact.findMany({
            where: {
                name: {
                    startsWith: name,
                },
            },
        });

        const startsWithNameSpam = await prisma.contact.findMany({
            where: {
                name: {
                    startsWith: name,
                },
            },
        });

        // Search for users whose names contain the search query (but don't start with it)
        const containsNameUser = await prisma.user.findMany({
            where: {
                name: {
                    contains: name,
                    not: {
                        startsWith: name,
                    },
                },
            },
        });

        const containsNameContact = await prisma.contact.findMany({
            where: {
                name: {
                    contains: name,
                    not: {
                        startsWith: name,
                    },
                },
            },
        });

        const containsNameSpam = await prisma.spam.findMany({
            where: {
                name: {
                    contains: name,
                    not: {
                        startsWith: name,
                    },
                },
            },
        });

        const results = [...startsWithNameUser, ...startsWithNameContacts, ...startsWithNameSpam, ...containsNameUser, ...containsNameContact, ...containsNameSpam];
        res.json(results);
    } catch (error) {
        console.error('Error searching for a person by name:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to search for a person by phone number
searchRouter.get('/search/phoneNumber/:phoneNumber', verifyToken, async (req: Request, res: Response) => {
    try {
        const { phoneNumber } = req.params;
        // Search for users with the given phone number
        const usersWithPhoneNumber = await prisma.user.findMany({
            where: {
                phoneNumber,
            },
        });

        // Search for contacts with the given phone number
        const contactsWithPhoneNumber = await prisma.contact.findMany({
            where: {
                phoneNumber,
            },
        });

        // Search for Spam with the given phone number
        const spamsWithPhoneNumber = await prisma.contact.findMany({
            where: {
                phoneNumber,
            },
        });

        const results = [...usersWithPhoneNumber, ...contactsWithPhoneNumber, ...spamsWithPhoneNumber];
        res.json(results);
    } catch (error) {
        console.error('Error searching for a person by phone number:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get detailed information for a search result
searchRouter.get('/search/detail/:phoneNumber', verifyToken, async (req: Request, res: Response) => {
    try {
        const { phoneNumber } = req.params;
        // Find the user by phoneNumber
        const user = await prisma.user.findUnique({
            where: { phoneNumber },
        });

        // Find the contact by phoneNumber if user is not found
        if (!user) {
            const contact = await prisma.contact.findFirst({
                where: { phoneNumber },
            });

            if (contact) {
                return res.json({
                    id: null,
                    name: contact.name,
                    phoneNumber: contact.phoneNumber,
                    email: null,
                    spamLikelihood: await calculateSpamLikelihood(contact.phoneNumber),
                });
            }
        }

        // Find the spam record by phoneNumber
        const spamRecord = await prisma.spam.findFirst({
            where: { phoneNumber },
        });

        // Construct the result object
        const result = {
            id: user ? user.id : spamRecord?.id,
            name: user ? user.name : spamRecord?.name,
            phoneNumber: user ? user.phoneNumber : spamRecord?.phoneNumber,
            email: user ? user.email : null,
            spamLikelihood: await calculateSpamLikelihood(phoneNumber),
        };

        res.json(result);
    } catch (error) {
        console.error('Error retrieving detailed information for search result:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
