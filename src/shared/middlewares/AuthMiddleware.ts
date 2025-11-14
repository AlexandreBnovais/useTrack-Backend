// src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

export interface AuthenticatedRequest<
    TParams = {},
    TResBody = any,
    TReqBody = any,
    TReqQuery = {},
> extends Request<TParams, TResBody, TReqBody, TReqQuery> {
    userId?: string;
}

export interface ListLeadsQuery {
    stageId?: string;
    sellerId?: string;
}

const JWT_SECRET = process.env.ACESS_TOKEN_SECRET || "minha_secreta_padrao";

export const authenticateToken = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    const authHeader = req.headers["authorization"];
    // Espera-se "Bearer TOKEN"
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        return res.status(401).json({
            message: "Token de autenticação ausente.",
        }); // Não autorizado
    }

    // Verifica e decodifica o token
    jwt.verify(token, JWT_SECRET, async (err, decoded: any) => {
        if (err) {
            console.error(`Erro de JWT: `, err.message);
            return res
                .status(403)
                .json({ message: "Token inválido ou expirado." });
        }

        if (!decoded || typeof decoded.id !== "string") {
            console.error(
                "Payload JWT inválido: ID do usuário ausente ou no formato incorreto.",
            );
            return res
                .status(403)
                .json({ message: "Token malformado (ID do usuário ausente)." });
        }

        req.userId = decoded.id;

        next();
    });
};
