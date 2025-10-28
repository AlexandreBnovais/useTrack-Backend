import type { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import 'dotenv/config';

export function AuthenticationMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if(!token) {
        res.status(401).json({ message: "Token não fornecido"});
        return;
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if(!secret) throw new Error('chave de segurança não encontrada nas variaveis de ambientes');

    JWT.verify(token, secret, (err, decoded) => {
        if(err) {
            res.status(403).json({ message: 'Token invalido ou expirado'});
            return;
        }

        (req as any).user = decoded;
    });
}