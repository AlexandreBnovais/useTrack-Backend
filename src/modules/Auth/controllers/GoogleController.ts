import type { Request, Response } from "express";
import { GoogleAuthService } from "../service/GoogleService.ts";
import { GoogleRepository } from "../repositories/GoogleRepository.ts";
import { GoogleAuthClient } from "../../../shared/utils/googleAuth.ts";

class GoogleAuthController {
    private serviceAuthGoogle: GoogleAuthService;
    constructor() {
        const googleRepository = new GoogleRepository();
        const googleClient = new GoogleAuthClient();
        this.serviceAuthGoogle = new GoogleAuthService(googleClient, googleRepository);
    }
    getAuthorizationCode( req: Request, res: Response ) {
        try {
            const result = this.serviceAuthGoogle.redirectUrl();

            if(!result.success ) {
                return res.status(400).json({ 
                    success: false,
                    message: result.message
                });
            }

            return res.status(200).redirect(result.redirect!);
        }catch( err ) { 
            console.error("Error during authorization: ", err);
            return res.status(500).json({ 
                success: false,
                message: "Internal Server Error during authorization process."
            });
        }
    }

    async loginWithGoogle(req: Request, res: Response) {
        try {
            const code  = req.query.code as string;

            if (!code) {
                return res.status(400).json({
                    success: false,
                    message: "Missing Google with auth code",
                });
            }

            const result = await this.serviceAuthGoogle.authenticateWithGoogle(code);

            if(!result.success) {
                return res.status(401).json({ 
                    message: result.message
                });
            }

            return res.status(200).json({
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: result.user
            })
        } catch (err) {
            console.error("Google auth error: ", err);
            return res.status(500).json({
                success: false,
                message: "Google authenticate falied",
            });
        }
    }
}

export default new GoogleAuthController();
