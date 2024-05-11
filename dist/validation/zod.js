"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markSpamSchema = exports.userRegistrationSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const phoneNum = /^\d{10}$/;
// Schema for user registration request body
exports.userRegistrationSchema = zod_1.default.object({
    name: zod_1.default.string().min(1),
    phoneNumber: zod_1.default.string().min(1).refine((val) => phoneNum.test(val), {
        message: 'Invalid phone number. Must be 10 digits without spaces or special characters.',
    }),
    email: zod_1.default.string().email().optional(),
    password: zod_1.default.string().min(1),
    contacts: zod_1.default.array(zod_1.default.object({
        name: zod_1.default.string(),
        phoneNumber: zod_1.default.string()
    })).optional(),
});
// Schema for marking a number as spam request body
exports.markSpamSchema = zod_1.default.object({
    phoneNumber: zod_1.default.string().min(1).refine((val) => phoneNum.test(val), {
        message: 'Invalid phone number. Must be 10 digits without spaces or special characters.',
    }),
});
