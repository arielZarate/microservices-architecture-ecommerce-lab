import { AsyncLocalStorage } from "node:async_hooks";
declare const userContext: AsyncLocalStorage<{
    id: number;
    name: string;
    email: string;
    role: string;
}>;
export default userContext;
//# sourceMappingURL=user.context.d.ts.map