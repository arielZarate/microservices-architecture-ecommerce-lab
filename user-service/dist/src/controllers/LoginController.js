const loginController = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
    }
    res.json({ message: 'Login successful', token: 'fake-jwt-token' });
};
export default loginController;
//# sourceMappingURL=LoginController.js.map