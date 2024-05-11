"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRouter = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware_1 = require("../middleware/middleware");
const zod_1 = require("../validation/zod");
const config_1 = require("../config/config");
const prisma = new client_1.PrismaClient();
exports.registerRouter = express_1.default.Router();
// Endpoint for registering new users with contacts
exports.registerRouter.post('/register', middleware_1.checkExistingUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = zod_1.userRegistrationSchema.parse(req.body);
        // Create user record
        const user = yield prisma.user.create({
            data: {
                name: userData.name,
                phoneNumber: userData.phoneNumber,
                email: userData.email,
                password: userData.password
            },
        });
        res.status(201).json({ message: 'User registered successfully.', token: req.token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}));
// Endpoint for user login
exports.registerRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber, password } = req.body;
        // Find user by phone number and password
        const user = yield prisma.user.findFirst({
            where: {
                phoneNumber,
                password,
            },
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid phone number or password.' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ phoneNumber }, config_1.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful.', token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}));
