import axios from "axios";
import { load } from "cheerio";
import fetch from "node-fetch";

// Function to extract blog content
export const extractBlogContent = async (req, res) => {
    console.log("👍🏻Received request to extract blog content");
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, error: "⛔️Blog URL is required" });
    }

    try {
        console.log(`📥 Fetching content from URL: ${url}`);
        const { data } = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        console.log("📥 Parsing blog content with Cheerio");
        const $ = load(data);
        let content = $(".paragraph-m, .post-heading").text().trim() || $("body").text().trim();

        if (!content) {
            console.warn("⛔️No extractable content found");
            return res.status(200).json({ success: true, data: { content: "No content extracted" } });
        }

        console.log("✅ Successfully extracted blog content");
        return { success: true, content};
    } catch (error) {
        console.error(`⛔️ Error extracting blog content: ${error.message}`);
        return { success: false, error: "⛔️Failed to extract content", content: null };
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
        const response = await fetch(process.env.LLM_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3.2:3b",
                messages: [
                    { 
                        role: "user", 
                        content: "You are an expert summarizer with a deep understanding of various subjects, including scientific, technical, literary, and business domains. Your role involves distilling complex information into concise and clear summaries that accurately represent the main ideas and essential details. You possess strong analytical skills that allow you to identify key points, themes, and arguments in a wide range of texts, from research papers to legal documents, and from news articles to novels. You excel at synthesizing information from multiple sources, ensuring that your summaries are comprehensive yet approachable. Your attention to detail enables you to capture nuances in language and tone, while your ability to discern the most critical elements ensures that your summaries resonate with the intended audience. You are also skilled in tailoring your writing style to suit different formats, whether it's an executive briefing, a student report, or a casual blog post. Your extensive vocabulary and command of language empower you to convey complex ideas clearly and succinctly, making understanding accessible to all readers. You stay updated on current trends and terminologies across various fields, which enhances your summarization prowess. Your ultimate goal is to provide readers with a tool for quick comprehension, enabling them to grasp the essence of longer texts without sacrificing depth or accuracy." 
                    },
                    { 
                        role: "user", 
                        content: `Summarize this blog post: "${blogData}"` 
                    },
                ],
                temperature: 0.85,
                max_tokens: 4096,
                stream: false,
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "summary_response",
                        strict: "true",
                        schema: {
                            type: "object",
                            properties: {
                                overview: { type: "string" },
                                detailed_key_points: { 
                                    type: "array", 
                                    items: { type: "string" },
                                    description: "Minimum 5 key points."
                                },
                                conclusion: { type: "string" }
                            },
                            required: ["overview", "detailed_key_points", "conclusion"]
                        }
                    }
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`⛔️ API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            let summary = data.choices[0].message.content;
            
            try {
                if (typeof summary === "string") {
                    summary = JSON.parse(summary);
                }
            } catch (parseError) {
                throw new Error("⛔️ Failed to parse AI response");
            }

            console.log("✅ Summary successfully generated");
            return { success: true, data: summary };
        }

        throw new Error("⛔️ AI response did not contain valid choices");
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
        if (!data.overview || !Array.isArray(data.detailed_key_points) || !data.conclusion) {
            console.error("⛔️ Invalid summary data structure. Missing required fields.");
            return { success: false, error: "⛔️ Malformed JSON structure. Required fields missing.", persona: null };
        }

        console.log("🚀 Preparing request payload for AI persona generation...");
        const requestBody = {
            model: "llama3.2:3b",
            messages: [
                { 
                    role: "system", 
                    content: "You are an expert in creating detailed and accurate target audience personas based on provided content summaries..."
                },
                { 
                    role: "user", 
                    content: `Overview: ${data.overview}\n\nDetailed Key Points:\n${data.detailed_key_points.map((point, index) => `${index + 1}. ${point}`).join('\n')}\n\nConclusion: ${data.conclusion}\n\nPlease analyze the above information and create a comprehensive persona.` 
                },
                { 
                    role: "user", 
                    content: "Return only JSON, with comprehensive and well-structured persona details." 
                }
            ],
            temperature: 0.85,
            max_tokens: 4096,
            stream: false,
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "persona_response",
                    strict: "true",
                    schema: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            age: { type: "integer" },
                            gender: { type: "string" },
                            interests: { type: "array", items: { type: "string" } },
                            behaviors: { type: "array", items: { type: "string" } },
                            painPoints: { type: "array", items: { type: "string" } },
                            goals: { type: "array", items: { type: "string" } },
                            challenges: { type: "array", items: { type: "string" } },
                            preferred_channels: { type: "array", items: { type: "string" } }
                        },
                        required: ["name", "age", "gender", "interests", "behaviors", "painPoints", "goals", "challenges", "preferred_channels"]
                    }
                }
            }
        };

        console.log("🚀 Sending request to AI API...");
        const response = await fetch(process.env.LLM_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        console.log(`📩 API Response Status: ${response.status}`);
        
        let responseText = await response.text(); // Read raw response text for debugging
        console.log("📩 Raw API Response:", responseText);

        if (!response.ok) {
            console.error(`⛔️ API request failed with status ${response.status}`);
            return { success: false, error: `⛔️ API request failed: ${response.statusText}`, persona: null };
        }

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (parseError) {
            console.error("⛔️ Failed to parse API response JSON:", parseError);
            return { success: false, error: "⛔️ API returned invalid JSON response.", persona: null };
        }

        console.log("📩 Parsed API Response:", responseData);

        if (!responseData.choices || responseData.choices.length === 0) {
            console.error("⛔️ AI response did not contain valid choices.");
            return { success: false, error: "⛔️ AI response format incorrect.", persona: null };
        }

        let persona;
        try {
            persona = responseData.choices[0].message.content;
            if (typeof persona === "string") {
                persona = JSON.parse(persona);
            }
        } catch (parseError) {
            console.error("⛔️ Failed to parse AI-generated persona JSON:", parseError);
            return { success: false, error: "⛔️ AI response contains malformed JSON.", persona: null };
        }

        console.log("✅ Persona successfully generated:", persona);
        return { success: true, persona };
    } catch (error) {
        console.error(`⛔️ Error in persona generation: ${error.message}`);
        return { success: false, error: `⛔️ Unexpected error: ${error.message}`, persona: null };
    }
};

// Function to process blog content (CHAINING all 3)**
export const processBlogContent = async (req, res) => {
    console.log("👍🏻 Received request to process blog content");
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, error: "⛔️Blog URL is required" });
    }

    let extractedContent = null;
    let summaryData = null;
    let personaData = null;

    try {
        //---------------- Extracting Content ---------------------------------------------
        console.log("Step 1️⃣: Extracting content...");
        const extractResponse = await extractBlogContent(req, res);
        extractedContent = extractResponse;
        if (!extractResponse.success) throw new Error(extractResponse.error);
        
        //---------------- Generating Simmary ---------------------------------------------
        console.log("Step 2️⃣: Summarizing extracted content...");
        const summaryResponse = await summarizer(extractedContent.content);
        summaryData = summaryResponse;
        if (!summaryResponse.success) throw new Error(summaryResponse.error);
        
        //---------------- Generating persona ---------------------------------------------
        console.log("Step 3️⃣: Generating persona from summary...");
        const personaResponse = await generatePersona(summaryData.data);
        personaData = personaResponse;
        if (!personaResponse.success) throw new Error(personaResponse.error);
        
        //---------------- Success  -------------------------------------------------------
        console.log("✅ Successfully processed blog content");
        return res.status(200).json({
            success: true,
            data: {
                url,
                summary: summaryData,
                persona: personaData,
            },
        });
    } catch (error) {
        console.error(`⛔️ Error processing blog content: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: error.message,
            previous_outputs: {
                extracted_content: extractedContent || "N/A",
                summary: summaryData || "N/A",
                persona: personaData || "N/A",
            },
        });
    }
};