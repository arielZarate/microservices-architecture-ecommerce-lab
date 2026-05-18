import { Request, Response, NextFunction} from "express";
import jwt from 'jsonwebtoken';
import userContext from "../context/user.context.js";

const  secretKey = process.env.JWT_SECRET


interface UserDTO {
    id: number;
    name: string;
    email: string;
    role: string;
}   

const middleware_security = (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers['authorization'] as string | undefined;              

        if (!authHeader) {  
         return res.status(401).json({ message: 'The Token is required' });
       }
        
        const token = authHeader.split(' ')[1]; 
        if (!token) {
            return res.status(401).json({ message: 'The Token is invalid' });
        }
         try {
             const decoded = jwt.verify(token, secretKey as string) as UserDTO; 
              userContext.run(decoded, () => {
                 next();
            });
         } catch (err: any) {
            console.log('JWT Error:', err?.message);
             return res.status(401).json({ message: 'The Token is invalid' });
         }
    }
  

export default middleware_security;

