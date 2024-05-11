import express, { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import jwt from "jsonwebtoken"
import { checkExistingUser } from "../middleware/middleware";
import { userRegistrationSchema } from "../validation/zod";
import { JWT_SECRET } from "../config/config";

const prisma = new PrismaClient()

export const registerRouter = express.Router();


// Endpoint for registering new users with contacts
registerRouter.post('/register', checkExistingUser, async (req: Request, res: Response) => {
    try {
        const userData = userRegistrationSchema.parse(req.body);

        // Create user record
        const user = await prisma.user.create({
            data: {
                name: userData.name,
                phoneNumber: userData.phoneNumber,
                email: userData.email,
                password: userData.password
            },
        });

        res.status(201).json({ message: 'User registered successfully.', token: req.token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Endpoint for user login
registerRouter.post('/login', async (req: Request, res: Response) => {
    try {
        const { phoneNumber, password } = req.body;

        // Find user by phone number and password
        const user = await prisma.user.findFirst({
            where: {
                phoneNumber,
                password,
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid phone number or password.' });
        }

        // Generate JWT token
        const token = jwt.sign({ phoneNumber }, JWT_SECRET, { expiresIn: '1h' });
        localStorage.setItem('token', token);
        res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});