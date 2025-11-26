import { hashPassword } from "../../../shared/utils/auth.js";
import { prisma } from "../../../shared/libs/prisma.js";
import type { Prisma, User } from "@prisma/client";

type CreateUserInput = Prisma.UserCreateInput;
type UserUpdateInput = Prisma.UserUpdateInput;

export class UserRepository { 
    async findById(id: string): Promise<CreateUserInput | null> {
        return prisma.user.findUnique({
            where: {id},
            select: {
                id: true,
                nome: true,
                email: true,
                role: true,
            }
        })
    }

    async update(id: string, data: UserUpdateInput): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: {
                ...data,
                password: await hashPassword(data.password as string)
            }
        });
    }

    async delete( id: string ): Promise<void> {
        await prisma.user.delete({ 
            where: { id }
        });
    }
}