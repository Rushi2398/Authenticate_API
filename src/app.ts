import express from "express";
import cors from "cors";
import { registerRouter } from "./routes/register";
import { searchRouter } from "./routes/search";
import { spamRouter } from "./routes/spam";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', [registerRouter, searchRouter, spamRouter]);

app.listen(PORT, () => {
    `Server is running on ${PORT}`
});