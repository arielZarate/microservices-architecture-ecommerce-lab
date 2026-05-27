import express from 'express';
const router = express.Router();
router.get('/', (req, res) => {
    res.json({ message: '🔥Microservice USER 💥' });
});
export default router;
//# sourceMappingURL=api.route.js.map