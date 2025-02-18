import express from 'express';
const router = express.Router();
import { fetchAIResponse } from '../controllers/ai_model.js';

// Function to summarize blog content

router.get('/get-subreddits', async (req, res) => {
    try {
        const format = {
                type: "object",
                properties: {
                    subreddits: {
                        type: "array",
                        items: { type: "string" }
                    }
                },
            required: ["subreddits"]
        };
        const response = await fetchAIResponse([{ role: "user", content: "Give top relevant subreddits for this topic topic: AI Photo generators" }], format);
        res.json({ success: true, data: response ?? [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;