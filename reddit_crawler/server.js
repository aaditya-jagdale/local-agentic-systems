//basic express server
import express from 'express';
import router from './router/router_v1.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();


app.listen(2802, () => {
    console.log('Server is running on port 2802');
});

app.use('/', router);

