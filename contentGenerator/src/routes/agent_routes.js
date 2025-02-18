import { Router } from 'express';
import multer from 'multer';
import { extractBlogContent, generateLinkedInPost, generatePersona, postReviewer, processBlogContent, summarizer } from '../controllers/agents.js';
import { makeApiRequest } from '../controllers/ai_model.js';

const router = Router();
const upload = multer();

// Basic test API request
router.post('/', async (_, res) => {
    try {
         const requestBody = {
            model: "llama3.2:3b",
            messages: [
                
                { 
                    role: "user", 
                    content: "This is a test" 
                },
            ],
        };
        const output = await makeApiRequest(process.env.LLM_URL, requestBody);
        res.status(200).json({success: true, data: output});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

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

// Linkedin Post Generator
router.post('/linkedin-post-generator', async (req, res) => {
    try {
        const { blog, persona } = req.body;
        if (!blog || !persona) {
            return res.status(400).json({ success: false, message: "blog, and persona are required" });
        }
        
        const linkedInPost = await generateLinkedInPost({ summary: blog, persona }); // Ensure async call
        res.status(200).json({ success: true, data: linkedInPost });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Post rating AI
router.post('/post-reviewer', async (req, res) => {
    try {
        const { post, persona, threshold = 7 } = req.body;
        if (!post || !persona) {
            return res.status(400).json({ success: false, message: "Post and persona are required" });
        }

        let reviewResponse = await postReviewer({ post, persona, threshold });

        while (!reviewResponse.success) {
            const { instructions } = reviewResponse;
            const newPostResponse = await generateLinkedInPost({ summary: post, persona, instructions });
            reviewResponse = await postReviewer({ post: newPostResponse.data, persona, threshold });
        }

        res.status(200).json({ success: true, data: reviewResponse.data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;