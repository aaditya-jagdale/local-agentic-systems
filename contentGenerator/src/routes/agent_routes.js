import { Router } from 'express';
import multer from 'multer';
import { extractBlogContent, generatePersona, processBlogContent, summarizer } from '../controllers/agents.js';

const router = Router();
const upload = multer();

// Blog to LinkedIn Post generator
router.post('/process-blog', async (req, res) => {
    try {
        await processBlogContent(req, res);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Blog content extractor
router.post('/blog-content-extractor', upload.none(), async (req, res) => {
    try {
        const response = await extractBlogContent(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Summarizer
router.post('/summarizer', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ success: false, message: "Content is required" });

        const summaryResponse = await summarizer(content);
        res.status(200).json(summaryResponse);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Persona Generator
router.post('/persona-generator', upload.none(), async (req, res) => {
    try {
        const { data } = req.body;  // Ensure this is extracted properly
        if (!data) return res.status(400).json({ success: false, message: "Summary data is required" });

        const personaResponse = await generatePersona(data); // Ensure `generatePersona` is called properly
        res.status(200).json(personaResponse);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;