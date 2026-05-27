export class HttpError extends Error {
    statusCode;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}
export const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    console.error(`[ERROR] ${statusCode}: ${message}`);
    res.status(statusCode).json({
        error: {
            type: err.name,
            title: message,
            status: statusCode,
        },
    });
};
export const notFoundHandler = (_req, res) => {
    res.status(404).json({
        error: {
            type: 'not_found',
            title: 'Route not found',
            status: 404,
        },
    });
};
//# sourceMappingURL=errorHandler.js.map