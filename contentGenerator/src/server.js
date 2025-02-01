import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = 46371;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});