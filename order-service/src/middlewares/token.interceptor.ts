import { NextFunction } from "express";


const interceptors_token = (req: Request, res: Response, next: NextFunction) => {
     // const authHeader = req.headers['authorization'];              

       // if (!authHeader) {  

            //return res.status(401).json({ message: 'Token de autenticación requerido' });
       // }
        
        //const token = authHeader.split(' ')[1]; // Extraer el token del header
        //if (!token) {
         //   return res.status(401).json({ message: 'Token de autenticación inválido' });
        //}

        // Aquí podrías agregar lógica para verificar el token, por ejemplo, usando JWT
        // try {
        //     const decoded = jwt.verify(token, 'tu_secreto');
        //     req.user = decoded; // Agregar información del usuario al request
        //     next();
        // } catch (err) {
        //     return res.status(401).json({ message: 'Token de autenticación inválido' });
        // }

        console.log({ TokenRecibido: 'token_ejemplo' });
        next();
    }
  

export default interceptors_token;


