"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const register_1 = require("./routes/register");
const search_1 = require("./routes/search");
const spam_1 = require("./routes/spam");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', [register_1.registerRouter, search_1.searchRouter, spam_1.spamRouter]);
app.listen(PORT, () => {
    `Server is running on ${PORT}`;
});
