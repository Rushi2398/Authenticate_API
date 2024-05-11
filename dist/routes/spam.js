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
exports.spamRouter = void 0;
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../middleware/middleware");
const client_1 = require("@prisma/client");
const zod_1 = require("../validation/zod");
exports.spamRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Endpoint for marking phoneNumbers as spam
exports.spamRouter.post('/spam', middleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber } = zod_1.markSpamSchema.parse(req.body);
        let existingSpam = yield prisma.spam.findFirst({
            where: {
                phoneNumber
            }
        });
        if (existingSpam) {
            const totalSpamCount = yield prisma.spam.count();
            const phoneNumberSpamCount = yield prisma.spam.count({
                where: {
                    phoneNumber
                }
            });
            const likelihood = totalSpamCount > 0 ? phoneNumberSpamCount / totalSpamCount : 0;
            existingSpam = yield prisma.spam.update({
                where: {
                    id: existingSpam.id,
                },
                data: {
                    likelihood: likelihood,
                },
            });
            res.json(existingSpam);
        }
        else {
            const totalSpamCount = yield prisma.spam.count();
            const likelihood = totalSpamCount > 0 ? 1 / totalSpamCount : 1;
            const userSpam = yield prisma.user.findFirst({
                where: {
                    phoneNumber: req.phoneNumber
                }
            });
            yield prisma.spam.create({
                data: {
                    phoneNumber,
                    likelihood,
                    userId: userSpam === null || userSpam === void 0 ? void 0 : userSpam.id
                },
            });
            res.status(201).json({ message: 'Number marked as spam successfully' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}));
