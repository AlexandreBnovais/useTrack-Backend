import {
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
} from "../../../shared/utils/auth.ts";
import { AuthenticationSchema } from "../../../shared/validators/AuthenticationSchema.ts";
import { AuthenticationRepository } from "../repositories/AuthenticateRepository.ts";

export class AuthenticationService {
    private AuthRepository: AuthenticationRepository;
    constructor(AuthRepository: AuthenticationRepository) {
        this.AuthRepository = AuthRepository;
    }

    async AuthenticateUser(body: any) {
        // Validate input field
        const parse = AuthenticationSchema.safeParse(body);

        if (!parse.success) {
            return {
                success: false,
                message: "Validation falied",
                details: parse.error.format(),
            };
        }
        // Extract input from request body
        const { email, password } = parse.data;

        try {
            // Verify email exist
            const existUser = await this.AuthRepository.findUser(email);
            if (!existUser) {
                return {
                    success: false,
                    message: "Usuario ou senha invalidos",
                };
            }
            //  Compare passwords
            const isValid = await comparePassword(existUser.password, password);
            if (!isValid) {
                return {
                    success: false,
                    message: "Usuario ou senha invalidos",
                };
            }
            // Generate token and refresh token
            const payload = {
                id: existUser.id,
                email: existUser.email,
                nome: existUser.nome,
            };
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            // Stores in the database

            await this.AuthRepository.saveRefreshToken(refreshToken, {
                email: existUser.email,
            });

            return {
                success: true,
                message: "Login efetuado com successo",
                token: accessToken,
                refresh: refreshToken,
            };
        } catch (err) {
            console.error(err);
            return {
                success: false,
                message:
                    err instanceof Error
                        ? err.message
                        : "Erro interno no servidor",
            };
        }
    }

    async RegistrationUser(body: any) {
        const parse = AuthenticationSchema.safeParse(body);

        if (!parse.success) {
            return {
                error: "Validation falied",
                details: parse.error.format(),
            };
        }

        const { email, nome, password } = parse.data;

        try {
            const existUser = await this.AuthRepository.findUser(email);
            if (existUser) throw new Error("Email já existe");

            const createUser = await this.AuthRepository.createUser({
                email,
                nome,
                password
            });

            if (!createUser) {
                return {
                    success: "false",
                    message: "Erro ao criar novo usuario",
                };
            }

            return {
                success: true,
                message: "Usuario criado com sucesso",
                user: {
                    id: createUser.id,
                    nome: createUser.nome,
                    email: createUser.email,
                },
            };
        } catch (err: any) {
            console.error(err);
            return {
                success: false,
                message: err.message || "Erro interno no servidor",
            };
        }
    }

    async RefreshAccessToken(refreshToken: string) {
        try {
            if (!refreshToken) {
                return {
                    success: false,
                    message: "Refresh token é obrigatorio",
                };
            }

            const decoded = verifyToken(refreshToken, "refresh");
            if (!decoded || typeof decoded !== "object") {
                return {
                    success: false,
                    message: "Token invalido",
                };
            }

            const { email } = decoded as { email: string};

            const tokenRecord =
                await this.AuthRepository.findRefreshToken(email);
            if (!tokenRecord) {
                return {
                    success: false,
                    message: "Refresh token não encontrado",
                };
            }

            if (tokenRecord.token !== refreshToken) {
                return {
                    success: false,
                    message: "Refresh token invalido",
                };
            }

            const user = await this.AuthRepository.findUser(email);
            if (!user) {
                return {
                    success: false,
                    message: "Usuario não encontrado",
                };
            }

            // Create token
            const payload = {
                id: user.id,
                nome: user.nome,
                email: user.email,
            };
            const newAccessToken = generateAccessToken(payload);
            const newRefreshToken = generateRefreshToken(payload);

            // Rotate refresh token
            await this.AuthRepository.saveRefreshToken(newRefreshToken, {
                email,
            });

            return {
                success: true,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (err) {
            console.error(err);
            return {
                success: false,
                message:
                    err instanceof Error
                        ? err.message
                        : "Erro interno no servidor",
            };
        }
    }
}
