import { AsyncLocalStorage } from "node:async_hooks";

const tokenContext = new AsyncLocalStorage<string>();

export default tokenContext;
