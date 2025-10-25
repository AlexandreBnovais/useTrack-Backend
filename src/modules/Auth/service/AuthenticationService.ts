import {
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
} from "../../../shared/ultils/auth.ts";
import { AuthenticationSchema } from "../../../shared/validators/AuthenticationSchema.ts";
import { AuthenticationRepositorie } from "../repositories/AuthRepository.ts";

export class AuthenticationService {
    static async AuthenticateUser(body: any) {
        const parse = AuthenticationSchema.safeParse(body);

        if (!parse.success) {
            return parse.error.format();
        }

        try {
            const { email, password } = parse.data;
            const user = await AuthenticationRepositorie.findUser(email);
            if (!user) throw new Error("Usuário não encontrado");

            const isValid = await comparePassword(user.password, password);
            if (!isValid) throw new Error("Usuário ou senha inválidos");

            const accessToken = generateAccessToken({
                id: user.id,
                email: user.email,
                nome: user.nome,
            });
            const refreshToken = generateRefreshToken({
                id: user.id,
                email: user.email,
                nome: user.nome,
            });

            await AuthenticationRepositorie.saveRefreshToken(refreshToken, {
                email: user.email,
            });

            return { accessToken, refreshToken };
        } catch (err) {
            console.error(err);
        }
    }

    static async RegistrationUser(body: any) {
        const parse = AuthenticationSchema.safeParse(body);

        if (!parse.success) {
            return parse.error.format();
        }

        try {
            const { email, nome, password } = parse.data;

            const user = await AuthenticationRepositorie.findUser(email);
            if (user) throw new Error("Email já existe");

            const createUser = await AuthenticationRepositorie.createUser({
                email,
                nome,
                password,
            });
            if (!createUser) throw new Error("Erro ao criar usuário");

            return createUser;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    static async RefreshAccessToken(refreshToken: string) {
        try {
            if (!refreshToken) throw new Error("Refresh token é obrigatorio");

            const decoded = verifyToken(refreshToken, "refresh");
            if (!decoded || typeof decoded !== "object")
                throw new Error("Token invalido");

            const { email } = decoded as { email: string };

            const tokenRecord =
                await AuthenticationRepositorie.findRefreshToken(email);
            if (!tokenRecord) throw new Error("Refresh token não encontrado");

            const newAccessToken = generateAccessToken({ email });

            return newAccessToken;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
