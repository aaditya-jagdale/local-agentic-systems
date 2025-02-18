import axios from 'axios';

const BASE_URL = 'http://localhost:11434/api/chat';
const MODEL_NAME = 'llama3.2:3b';

export const fetchAIResponse = async (messages, format = null, model = MODEL_NAME) => {
    try {
        const response = await axios.post(BASE_URL, {
            model: model,
            messages,
            stream: false,
            format: format
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching AI response:', error.message);
        return null;
    }
};
