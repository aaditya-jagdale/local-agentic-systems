import { load } from "cheerio";
import fetch from "node-fetch";
import { makeApiRequest } from "./ai_model.js";

// Function to extract blog content
export const extractBlogContent = async (req, res) => {
    console.log("👍🏻 Received request to extract blog content");
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, error: "⛔️ Blog URL is required" });
    }

    try {
        console.log(`📥 Fetching content from URL: ${url}`);
        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        if (!response.ok) {
            throw new Error(`⛔️ Failed to fetch content: ${response.statusText}`);
        }

        const html = await response.text();
        console.log("📥 Parsing blog content with Cheerio");
        const $ = load(html);
        let content = $(".paragraph-m, .post-heading").text().trim() || $("body").text().trim();

        if (!content) {
            console.warn("⛔️ No extractable content found");
            return res.status(200).json({ success: true, data: { content: "No content extracted" } });
        }

        console.log("✅ Successfully extracted blog content");
        return { success: true, content };
    } catch (error) {
        console.error(`⛔️ Error extracting blog content: ${error.message}`);
        return { success: false, error: error.message, content: null };
    }
};

// Function to summarize blog content
export const summarizer = async (blogData) => {
    console.log("👍🏻 Received request to summarize content");

    if (!blogData) {
        return { success: false, error: "⛔️ Blog content is either missing or in an incorrect format", summary: null };
    }

    if (!process.env.LLM_URL) {
        return { success: false, error: "⛔️ Missing LLM_URL environment variable", summary: null };
    }

    try {
        console.log("🚀 Sending content to AI summarization API");
        const requestBody = {
            model: "llama3.2:3b",
            messages: [
                { 
                    role: "user", 
                    content: " Act as an expert summarizer with a focus on condensing complex information into concise, clear, and actionable insights. Summarize the following text or content, [insert content or specify the topic], ensuring to highlight the main ideas, key arguments, and essential details while maintaining accuracy and coherence. Aim for clarity and brevity, so that the summary effectively communicates the core message to someone unfamiliar with the source material." 
                },
                { 
                    role: "user", 
                    content: `Summarize this blog post: "${blogData}"` 
                },
            ],
          
        };

        const summary = await makeApiRequest(process.env.LLM_URL, requestBody);
        console.log("✅ Summary successfully generated");
        return { success: true, data: summary};

    } catch (error) {
        console.error(`⛔️ Error generating summary: ${error.message}`);
        return { success: false, error: error.message, summary: null };
    }
};

// Function to generate persona from summary
export const generatePersona = async (data) => {
    console.log("👍🏻 Received request to generate target persona");

    if (!data) {
        console.error("⛔️ Missing summary data for persona generation.");
        return { success: false, error: "⛔️ Summary data is required", persona: null };
    }

    try {
        console.log("🚀 Preparing request payload for AI persona generation...");
        const requestBody = {
            model: "llama3.2:3b",
            messages: [
                { 
                    role: "system", 
                    content: "Act as a creative persona generator. Provide a diverse set of character profiles tailored who would be a an ideal target audience for the blog post below. For each persona, include detailed information such as their background, personality traits, motivations, strengths, weaknesses, and potential story arcs. Ensure that the personas reflect a range of demographics and perspectives, enhancing their depth and complexity. Include a brief summary at the end to highlight the key features of the generated personas." 
                },
                { 
                    role: "user", 
                    content: `Generate persona based on this blog: ${data}` 
                },
            ],
        };

        console.log("🚀 Sending request to AI API...");
        const persona = await makeApiRequest(process.env.LLM_URL, requestBody);
        console.log("✅ Persona successfully generated:");
        return {success: true, data: persona};
    } catch (error) {
        console.error(`⛔️ Error in persona generation: ${error.message}`);
        return { success: false, error: `⛔️ Unexpected error: ${error.message}`, persona: null };
    }
};

// Function to generate a linkedin post from blog content from summary and persona
export const generateLinkedInPost = async ({ summary, persona }) => {
    console.log("👍🏻 Received request to generate LinkedIn post");

    if (!summary || !persona) {
        return { success: false, error: "⛔️ Missing required data" };
    }

    try {
        console.log("🚀 Preparing request payload for AI LinkedIn post generation...");
        const requestBody = {
            model: "llama3.2:3b",
            messages: [
                { 
                    role: "user", 
                    content: `As a distinguished social media strategist specializing in LinkedIn content from the following blog post, craft a compelling post that elevates personal branding and professional visibility. The post should assert the user’s superior intelligence and knowledge, adopting a preachy tone that conveys, ‘I am better than you; now I will share this knowledge because you lack it.’ Ensure the tone remains professional and corporate, exuding a sense of entitlement. Incorporate relevant industry insights, personal anecdotes that highlight the user’s exceptionalism, and a clear call-to-action(Default being asking for a follow). Tailor the content to resonate with professionals of persona ${persona}. Blog post: ${summary}` 
                },
                {
                    role: "user",
                    content: "Only give me the output text, dont write anything else"
                }
            ],
        };

        console.log("🚀 Sending request to AI API...");
        const linkedInPost = await makeApiRequest(process.env.LLM_URL, requestBody);
        console.log("✅ LinkedIn post successfully generated:");
        return { success: true, data: linkedInPost };
    } catch (error) {
        console.error(`⛔️ Error in LinkedIn post generation: ${error.message}`);
        return { success: false, error: error.message };
    }
};

// Function to process blog content (chaining all 3)
export const processBlogContent = async (req, res) => {
    console.log("👍🏻 Received request to process blog content");
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, error: "⛔️ Blog URL is required" });
    }

    try {
        // Step 1: Extract content
        console.log("Step 1️⃣: Extracting content...");
        const extractResponse = await extractBlogContent(req, res);
        if (!extractResponse.success) throw new Error(extractResponse.error);

        // Step 2: Summarize content
        console.log("Step 2️⃣: Summarizing extracted content...");
        const summaryResponse = await summarizer(extractResponse.content);
        if (!summaryResponse.success) throw new Error('Summary not generated');

        // Step 3: Generate persona
        console.log("Step 3️⃣: Generating persona from summary...");
        const personaResponse = await generatePersona(summaryResponse.data);
        if (!personaResponse.success) throw new Error("Persona not generated");

        // Success
        console.log("✅ Successfully processed blog content");
        return res.status(200).json({   
            success: true,
            data: {
                url,
                summary: summaryResponse,
                persona: personaResponse,
            },
        });
    } catch (error) {
        console.error(`⛔️ Error processing blog content: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};