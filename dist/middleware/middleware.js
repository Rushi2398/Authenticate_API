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
exports.verifyToken = exports.checkExistingUser = void 0;
const zod_1 = require("../validation/zod");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const prisma = new client_1.PrismaClient();
// Middleware to check if user with given phone number already exists
const checkExistingUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = zod_1.userRegistrationSchema.parse(req.body);
        const existingUser = yield prisma.user.findUnique({
            where: {
                phoneNumber: userData.phoneNumber,
            },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this phone number already exists.' });
        }
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
exports.checkExistingUser = checkExistingUser;
// Middleware to verify and decode JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing.' });
    }
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token not provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        req.phoneNumber = decoded.phoneNumber;
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(403).json({ error: 'Invalid token.' });
    }
};
exports.verifyToken = verifyToken;
