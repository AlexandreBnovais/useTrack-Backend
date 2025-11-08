// src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'; 
import 'dotenv/config';

export interface AuthenticatedRequest<
    TParams = {},
    TResBody = any,
    TReqBody = any,
    TReqQuery = {}
> extends Request<TParams, TResBody, TReqBody, TReqQuery> {
    userId?: string;
}

export interface ListLeadsQuery {
    stageId?: string;
    sellerId?: string;
}

const JWT_SECRET = process.env.ACESS_TOKEN_SECRET || 'minha_secreta_padrao';

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    // Espera-se "Bearer TOKEN"
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        return res.sendStatus(401); // Não autorizado
    }

    // Verifica e decodifica o token
    jwt.verify(token, JWT_SECRET, (err, userPayload: any) => {
        if (err) {
            return res.sendStatus(403); // Acesso proibido (token inválido/expirado)
        }
        req.userId = userPayload.id; 
        
        next();
    });
};