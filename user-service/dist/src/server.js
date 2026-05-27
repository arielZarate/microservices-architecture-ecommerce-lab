import 'dotenv/config';
import app from './app.js';
import prisma from './lib/prisma.js';
const PORT = process.env.PORT || 4000;
const start = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected');
    }
    catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
    app.listen(PORT, () => {
        console.log(`User service running on port ${PORT}`);
    });
};
start();
//# sourceMappingURL=server.js.map