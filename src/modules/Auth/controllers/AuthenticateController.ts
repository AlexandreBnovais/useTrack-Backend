import type { Request, Response } from "express";
import { AuthenticationService } from "../service/AuthenticationService.ts";

export class AuthenticationController {
    // Rota: POST /auth/login
    public async login(req: Request, res: Response) {
        try {
            const token = await AuthenticationService.AuthenticateUser(
                req.body,
            );

            if (!token) {
                return res
                    .status(401)
                    .json({ message: "Credenciais inválidas" });
            }

            return res.status(200).json({ accessToken: token });
        } catch (err: any) {
            console.error(err);
            return res
                .status(500)
                .json({ message: err.message || "Erro interno" });
        }
    }

    // Rota: POST /auth/register
    public async register(req: Request, res: Response) {
        try {
            const user = await AuthenticationService.RegistrationUser(req.body);

            if (!user) {
                return res
                    .status(400)
                    .json({ message: "Erro ao criar usuário" });
            }

            return res.status(201).json({
                message: "Usuário criado com sucesso",
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                },
            });
        } catch (err: any) {
            console.error(err);
            return res
                .status(500)
                .json({ message: err.message || "Erro interno" });
        }
    }

    public async Refresh(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res
                    .status(400)
                    .json({ message: "Refresh token é obrigatorio" });
            }

            const newAccessToken =
                await AuthenticationService.RefreshAccessToken(refreshToken);
            return res.status(200).json({ accessToken: newAccessToken });
        } catch (err: any) {
            console.error(err);
            res.status(401).json({ message: err.message || "Token invalido" });
        }
    }
}
