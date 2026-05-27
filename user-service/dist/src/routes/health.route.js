import { Router } from "express";
const router = Router();
router.get('/', (req, res) => {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    console.log("Health check - Uptime:", uptime, "seconds");
    res.send({
        status: 'ok',
        service: 'user-service',
        timestamp: new Date().toISOString(),
        uptime: `${uptime.toFixed(2)}s`,
        memory: {
            rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        },
    });
});
export default router;
//# sourceMappingURL=health.route.js.map