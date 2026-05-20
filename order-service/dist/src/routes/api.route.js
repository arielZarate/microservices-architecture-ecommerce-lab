import express from 'express';
const router = express.Router();
// Root
router.get('/', (req, res) => {
    res.json('🔥Microservice ORDER 💥');
});
export default router;
//# sourceMappingURL=api.route.js.map