import { AsyncLocalStorage } from "node:async_hooks";

const userContext=new AsyncLocalStorage<{ 
id: number 
name: string,
lastName: string,
email: string
role: string
}>() ;  



export default userContext;