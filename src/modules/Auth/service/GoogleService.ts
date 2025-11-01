import {
    generateAccessToken,
    generateRefreshToken,
} from "../../../shared/utils/auth.ts";
import { GoogleAuthClient } from "../../../shared/utils/googleAuth.ts";
import { GoogleRepository } from "../repositories/GoogleRepository.ts";

export class GoogleAuthService {
    private GoogleClient: GoogleAuthClient;
    private GoogleRepository: GoogleRepository;

    constructor(
        GoogleClient: GoogleAuthClient,
        GoogleRepository: GoogleRepository
    ) {
        this.GoogleClient = GoogleClient;
        this.GoogleRepository = GoogleRepository;
    };

    redirectUrl() {
        try {
            const redirect = this.GoogleClient.getAuthUrl();

            if(!redirect || typeof redirect !== 'string' || redirect.trim() === ''){ 
                return { 
                    success: false,
                    message: "Falha ao gerar a URL de redirecionamento."
                };
            }

            return {
                success: true,
                redirect
            }
        }catch( err ) {
            console.error('Erro ao gerar a URL de redirecionamento: ' ,err);
            return {
                success: false,
                message: 'Erro inesperado ao gerar a URL de redirecionamento.'
            }
        }
    }

    async authenticateWithGoogle(code: string) {
        try { 
            const { access_token } = await this.GoogleClient.exchangeCodeForTokens(code);
            if(!access_token) {
                throw new Error('Access token not received from Google');
            }

            // Busca dados do usuario no Google
            const userInfo = await this.GoogleClient.getUserInfo(access_token);

            if(!userInfo || !userInfo.email) {
                throw new Error("Falied to retrieve user information from Google.");
            }

            const { email, name } = userInfo;

            const user = await this.GoogleRepository.findOrCreate({ email: email, name: name! });

            const payload = {
                id: user.id,
                email: user.email,
                name: user.name
            };

            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            // Armazena o refresh token
            await this.GoogleRepository.storeRefreshToken(refreshToken, user.id);

            return {
                success: true,
                accessToken,
                refreshToken,
                user: payload
            }
        }catch( err ) { 
            console.error("Google authenticate falied: ", err);
            return { 
                success: false,
                message: "Authenticate with Google falied",
                error: err instanceof Error ? err.message : 'Internal server Error'
            };
        }
    }
}
