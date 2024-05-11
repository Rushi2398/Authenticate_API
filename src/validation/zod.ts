import z from "zod";

const phoneNum = /^\d{10}$/;

// Schema for user registration request body
export const userRegistrationSchema = z.object({
    name: z.string().min(1),
    phoneNumber: z.string().min(1).refine((val) => phoneNum.test(val), {
        message: 'Invalid phone number. Must be 10 digits without spaces or special characters.',
    }),
    email: z.string().email().optional(),
    password: z.string().min(1),
    contacts: z.array(z.object({
        name: z.string(),
        phoneNumber: z.string()
    })).optional(),
});

// Schema for marking a number as spam request body
export const markSpamSchema = z.object({
    phoneNumber: z.string().min(1).refine((val) => phoneNum.test(val), {
        message: 'Invalid phone number. Must be 10 digits without spaces or special characters.',
    }),
});

