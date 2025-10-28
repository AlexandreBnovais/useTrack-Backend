import type { User } from "../../../shared/contracts/AuthContract.ts";
import { prisma } from "../../../shared/libs/prisma.ts";
import { hashPassword } from "../../../shared/ultils/auth.ts";

export class AuthenticationRepositorie {
    static async findUser(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    static async createUser(data: Pick<User, "email" | "nome" | "password">) {
        try {
            const user = prisma.user.create({
                data: {
                    nome: data.nome!,
                    email: data.email,
                    password: await hashPassword(data.password!),
                },
            });

            return user;
        } catch (err: any) {
            if (err.code == "P2002") {
                throw new Error("Email already in use");
            }
            throw err;
        }
    }

    static async saveRefreshToken(
        token: string,
        user: Pick<User, "email" | "id">,
    ) {
        return prisma.refreshToken.upsert({
            where: { userEmail: user.email },
            update: { token },
            create: {
                token,
                user: { connect: { email: user.email } },
            },
        });
    }

    static async findRefreshToken(email: string) {
        return prisma.refreshToken.findUnique({
            where: { userEmail: email },
            include: { user: true },
        });
    }
}
