export default class AuthController {
    registerService;
    constructor(registerService) {
        this.registerService = registerService;
    }
    register = async (req, res, next) => {
        try {
            const body = req.body;
            const result = await this.registerService.register(body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=auth.controller.js.map