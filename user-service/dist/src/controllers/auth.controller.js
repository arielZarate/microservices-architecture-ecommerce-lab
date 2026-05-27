export default class AuthController {
    registerService;
    loginService;
    resetPasswordService;
    constructor(registerService, loginService, resetPasswordService) {
        this.registerService = registerService;
        this.loginService = loginService;
        this.resetPasswordService = resetPasswordService;
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
    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const result = await this.loginService.login({ email, password });
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    };
    resetPassword = async (req, res, next) => {
        try {
            const { email, newPassword } = req.body;
            await this.resetPasswordService.reset(email, newPassword);
            res.status(200).json({ message: 'Password reset successfully' });
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=auth.controller.js.map