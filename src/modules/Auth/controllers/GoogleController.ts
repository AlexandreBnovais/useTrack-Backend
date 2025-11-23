import type { Request, Response } from "express";
import { GoogleAuthService } from "../service/GoogleService.js";

class GoogleAuthController {
    private serviceAuthGoogle: GoogleAuthService;
    constructor() {
        this.serviceAuthGoogle = new GoogleAuthService();

        this.getAuthorizationCode = this.getAuthorizationCode.bind(this);
        this.loginWithGoogle = this.loginWithGoogle.bind(this);
        this.googleLogout = this.googleLogout.bind(this);
    }
    getAuthorizationCode(req: Request, res: Response) {
        try {
            const result = this.serviceAuthGoogle.redirectUrl();

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                });
            }

            return res.status(200).redirect(result.redirect!);
        } catch (err) {
            console.error("Error during authorization: ", err);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error during authorization process.",
            });
        }
    }

    async loginWithGoogle(req: Request, res: Response) {
        try {
            const code = req.query.code as string;

            if (!code) {
                return res.status(400).json({
                    success: false,
                    message: "Missing Google with auth code",
                });
            }

            const result =
                await this.serviceAuthGoogle.authenticateWithGoogle(code);

            if (!result.success) {
                return res.status(401).json({
                    message: result.message,
                });
            }

            return res.status(200).json({
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: result.user,
            });
        } catch (err) {
            console.error("Google auth error: ", err);
            return res.status(500).json({
                success: false,
                message: "Google authenticate falied",
            });
        }
    }

    async googleLogout(req: Request, res: Response): Promise<Response> {
        const { refreshToken } = req.body;

        if(!refreshToken) {
            return res.status(400).json({ message: "Refresh token obrigatorio."});
        }

        try {
            await this.serviceAuthGoogle.deleteRefreshToken(refreshToken);
            return res.status(204).send();
        }catch(error) {
            console.error("Erro no logout: ", error);
            return res.status(500).json({ message: "Falha ao processar logout."});
        }
    }
}

export default new GoogleAuthController();
