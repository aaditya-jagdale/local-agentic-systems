//basic router
import express from 'express';
import crawlerRouter from './crawler_v1.js';
const router = express.Router();

router.get('/api/v1/', (req, res) => {
    res.send('Hello World');
});

router.use('/api/v1/crawler', crawlerRouter);

export default router;