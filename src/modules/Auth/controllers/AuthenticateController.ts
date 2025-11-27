import type { Request, Response } from "express";
import { AuthenticationService } from "../service/AuthenticationService";
import { AuthenticationRepository } from "../repositories/AuthenticateRepository";
import "dotenv/config";

class AuthenticationController {
    private AuthService: AuthenticationService;
    constructor() {
        const userRepository = new AuthenticationRepository();
        this.AuthService = new AuthenticationService(userRepository);
        
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
        this.Refresh = this.Refresh.bind(this);
        this.logout = this.logout.bind(this);
    }
    // Rota: POST /auth/login
    async login(req: Request, res: Response) {
        try {
            const result = await this.AuthService.AuthenticateUser(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    details: result.details,
                });
            }

            res.cookie("refreshToken", result.refresh, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "Production",
                sameSite: "strict",
            });

            return res.status(200).json({
                success: true,
                message: result.message,
                accessToken: result.token,
                refresh: result.refresh,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message:
                    err instanceof Error
                        ? err.message
                        : "Erro interno no servidor",
            });
        }
    }

    // Rota: POST /auth/register
    async register(req: Request, res: Response) {
        try {
            const result = await this.AuthService.RegistrationUser(req.body);

            if (result.error) {
                return res.status(400).json({
                    success: false,
                    message: result.message || "Erro de validação",
                    details: result.details || null,
                });
            }

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.message || "Erro ao criar usuario",
                });
            }

            return res.status(201).json({
                success: true,
                message: "Usuario criado com sucesso",
                user: result.user,
            });
        } catch (err: any) {
            console.error("Erro no controller", err);
            return res.status(500).json({
                success: false,
                message: err.message || "Erro interno no servidor",
            });
        }
    }

    async Refresh(req: Request, res: Response) {
        try {
            const refreshToken =
                req.cookies?.refreshToken || req.body.refreshToken;

            const result =
                await this.AuthService.RefreshAccessToken(refreshToken);
            if (!result.success) {
                return res.status(401).json(result);
            }

            return res.status(200).json(result);
        } catch (err: any) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message:
                    err instanceof Error
                        ? err.message
                        : "Erro interno no servidor",
            });
        }
    }

    async logout( req: Request, res: Response ): Promise<Response> {
        
        const { refreshToken } = req.cookies;

        if(!refreshToken) {
            return res.status(400).json({ message: "Refresh token obrigatório." });
        }
        
        try {
            await this.AuthService.deleteRefreshToken(refreshToken);
            return res.status(204).send();

        }catch(error) {
            console.error("Erro ao logout", error);
            return res.status(500).json({ message: "Falha ao processar logout"});
        }
    }
}

export default new AuthenticationController();
