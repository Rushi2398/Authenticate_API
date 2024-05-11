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
exports.searchRouter = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const middleware_1 = require("../middleware/middleware");
exports.searchRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Function to calculate spam likelihood based on the given phoneNumber
const calculateSpamLikelihood = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the spam record by phoneNumber
        const spamRecord = yield prisma.spam.findFirst({
            where: { phoneNumber },
        });
        return spamRecord ? spamRecord.likelihood : 0;
    }
    catch (error) {
        console.error('Error calculating spam likelihood:', error);
        return 0;
    }
});
// Endpoint to search for a person by name
exports.searchRouter.get('/search/name/:name', middleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.params;
        // Search for users whose names start with the search query
        const startsWithNameUser = yield prisma.user.findMany({
            where: {
                name: {
                    startsWith: name,
                },
            },
        });
        const startsWithNameContacts = yield prisma.contact.findMany({
            where: {
                name: {
                    startsWith: name,
                },
            },
        });
        const startsWithNameSpam = yield prisma.contact.findMany({
            where: {
                name: {
                    startsWith: name,
                },
            },
        });
        // Search for users whose names contain the search query (but don't start with it)
        const containsNameUser = yield prisma.user.findMany({
            where: {
                name: {
                    contains: name,
                    not: {
                        startsWith: name,
                    },
                },
            },
        });
        const containsNameContact = yield prisma.contact.findMany({
            where: {
                name: {
                    contains: name,
                    not: {
                        startsWith: name,
                    },
                },
            },
        });
        const containsNameSpam = yield prisma.spam.findMany({
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
    }
    catch (error) {
        console.error('Error searching for a person by name:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Endpoint to search for a person by phone number
exports.searchRouter.get('/search/phoneNumber/:phoneNumber', middleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber } = req.params;
        // Search for users with the given phone number
        const usersWithPhoneNumber = yield prisma.user.findMany({
            where: {
                phoneNumber,
            },
        });
        // Search for contacts with the given phone number
        const contactsWithPhoneNumber = yield prisma.contact.findMany({
            where: {
                phoneNumber,
            },
        });
        // Search for Spam with the given phone number
        const spamsWithPhoneNumber = yield prisma.contact.findMany({
            where: {
                phoneNumber,
            },
        });
        const results = [...usersWithPhoneNumber, ...contactsWithPhoneNumber, ...spamsWithPhoneNumber];
        res.json(results);
    }
    catch (error) {
        console.error('Error searching for a person by phone number:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Endpoint to get detailed information for a search result
exports.searchRouter.get('/search/detail/:phoneNumber', middleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber } = req.params;
        // Find the user by phoneNumber
        const user = yield prisma.user.findUnique({
            where: { phoneNumber },
        });
        // Find the contact by phoneNumber if user is not found
        if (!user) {
            const contact = yield prisma.contact.findFirst({
                where: { phoneNumber },
            });
            if (contact) {
                return res.json({
                    id: null,
                    name: contact.name,
                    phoneNumber: contact.phoneNumber,
                    email: null,
                    spamLikelihood: yield calculateSpamLikelihood(contact.phoneNumber),
                });
            }
        }
        // Find the spam record by phoneNumber
        const spamRecord = yield prisma.spam.findFirst({
            where: { phoneNumber },
        });
        // Construct the result object
        const result = {
            id: user ? user.id : spamRecord === null || spamRecord === void 0 ? void 0 : spamRecord.id,
            name: user ? user.name : spamRecord === null || spamRecord === void 0 ? void 0 : spamRecord.name,
            phoneNumber: user ? user.phoneNumber : spamRecord === null || spamRecord === void 0 ? void 0 : spamRecord.phoneNumber,
            email: user ? user.email : null,
            spamLikelihood: yield calculateSpamLikelihood(phoneNumber),
        };
        res.json(result);
    }
    catch (error) {
        console.error('Error retrieving detailed information for search result:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
