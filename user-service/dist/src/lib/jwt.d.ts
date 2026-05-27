export type TokenPayload = {
    id: number;
    email: string;
    role: string;
};
export declare function generateToken(payload: TokenPayload): string;
//# sourceMappingURL=jwt.d.ts.map