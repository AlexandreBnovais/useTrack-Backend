import type { Prisma, User } from "@prisma/client";
import { UserRepository } from "../repositories/user.repository.js";
import { prisma } from "../../../shared/libs/prisma.js";
import 'dotenv/config';

type CreateUserInput = Prisma.UserCreateInput;
type UserUpdateInput = Prisma.UserUpdateInput;

export class ProfileService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async getUserProfile(userId: string): Promise<CreateUserInput | null> {
        const user = await this.userRepository.findById(userId);

        if(!user) {
            throw new Error("Usuario não encontrado")
        }

        return user;
    }

    async updateProfile(userId: string, updateDate: UserUpdateInput): Promise<User> {
        if(updateDate.id || updateDate.role) {
            throw new Error("Não é permitido alterar ID ou cargo por essa rota.");
        }

        return this.userRepository.update(userId, updateDate);
    }

    async deleteProfile(userId: string): Promise<void> {
        const ADMIN_ID = process.env.ADMIN_USER_ID;
        if (!ADMIN_ID) {
            throw new Error("A variável de ambiente ADMIN_USER_ID não está definida.");
        }

        console.log(ADMIN_ID);
        await prisma.$transaction(async (tx) => {
    
            await tx.followUp.updateMany({ 
                where: { registeredById: userId},
                data: { registeredById: null},
            });

            await tx.lead.updateMany({ 
                where: { sellerId: userId},
                data: { sellerId: ADMIN_ID }
            });

            await tx.user.delete({
                where: { id: userId },
            });
        })
    }
}