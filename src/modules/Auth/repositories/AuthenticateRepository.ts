import type { User } from "@prisma/client";
import { prisma } from "../../../shared/libs/prisma.js";
import { hashPassword } from "../../../shared/utils/auth.js";

type CreateUserInput = Omit<User, "id" | "role" | "createdAt" | "updatedAt">;
type updateUserInput = Partial<User>;

export class AuthenticationRepository {
    async findUser(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    async createUser(data: CreateUserInput) {
        const user = prisma.user.create({
            data: {
                nome: data.nome,
                email: data.email,
                password: await hashPassword(data.password!),
            },
        });

        return user;
    }

    async saveRefreshToken(token: string, user: updateUserInput) {
        return prisma.refreshToken.upsert({
            where: { userEmail: user.email },
            update: { token },
            create: {
                token,
                user: { connect: { email: user.email } },
            },
        });
    }

    async findRefreshToken(email: string) {
        return prisma.refreshToken.findUnique({
            where: { userEmail: email },
            include: { user: true },
        });
    }
}
