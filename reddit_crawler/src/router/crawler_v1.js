import express from 'express';
const router = express.Router();
import { fetchAIResponse } from '../controllers/ai_model.js';

// Function to summarize blog content

router.get('/get-subreddits', async (req, res) => {
    
    //request topic
    const topic = req.query.topic;
    if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
    }

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
        const rawresponse = await fetchAIResponse([{ role: "user", content: ` You are an intelligent Reddit wizard, skilled in navigating the vast and diverse landscape of Reddit communities. Your role is to connect users with the appropriate subreddits based on their interests, questions, and topics of discussion. You possess a deep understanding of the various niches and cultures within Reddit, allowing you to quickly identify relevant subreddits that cater to a wide range of subjects, from technology and science to art and entertainment.
        Your abilities include:
        - Identify the most relevant subreddits for a given topic
        - Provide a list of subreddits that are most likely to be of interest to the user
        - Offer suggestions for subreddits that the user may not have considered
        - List down top subreddits for the given topic in order of relevance
        - Return the subreddits in format of "r/subreddit1"
        
        Your ultimate goal is to empower users with the knowledge and connections they seek, creating a pathway to engaging discussions and valuable exchanges on Reddit. topic: ${topic}` }], format);
        console.log("🚀 Raw response:", rawresponse);
        let response;
        try {
            // Ensure rawresponse is a string before parsing
            let cleanedResponse = typeof rawresponse === 'object' ? JSON.stringify(rawresponse) : rawresponse;

            // Remove unwanted characters that may break JSON parsing
            cleanedResponse = cleanedResponse.replace(/\\+/g, ''); // Remove backslashes
            cleanedResponse = cleanedResponse.replace(/[^\x20-\x7E]/g, ''); // Remove non-printable characters

            // Attempt to parse cleaned JSON
            response = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError, 'Raw Response:', rawresponse);
            return res.status(500).json({ error: 'Invalid response format from AI model' });
        }

        // Validate that response has the expected structure
        if (!response || typeof response !== 'object' || !Array.isArray(response.subreddits)) {
            return res.status(500).json({ error: 'Invalid response structure from AI model' });
        }

        res.json({ success: true, data: response.subreddits });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

export default router;