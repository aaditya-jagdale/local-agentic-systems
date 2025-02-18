import axios from 'axios';

const BASE_URL = 'http://localhost:11434/api/chat';
// const LLAMA = 'llama3.2:3b';
const DEEPSEEK = 'deepseek-r1:14b';
const QWEN = 'qwen2.5-coder:7b';

export const fetchAIResponse = async (messages, format = null, model = DEEPSEEK) => {
    try {
        console.log("🚀 Sending content to AI summarization API");
        const response = await axios.post(BASE_URL, {
            model: model,
            messages,
            stream: false,
            format: format
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log("✅ AI response received");
        return response.data.message.content;
    } catch (error) {
        console.error('Error fetching AI response:', error.message);
        return null;
    }
};
