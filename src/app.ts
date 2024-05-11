import express, { Request, Response } from "express";
import cors from "cors";
import { registerRouter } from "./routes/register";
import { searchRouter } from "./routes/search";
import { spamRouter } from "./routes/spam";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', [registerRouter, searchRouter, spamRouter]);

app.get('/', (req: Request, res: Response) => {
    res.json({
        msg: "Welcome to Authenticate API"
    })
})

app.listen(PORT, () => {
    `Server is running on ${PORT}`
});