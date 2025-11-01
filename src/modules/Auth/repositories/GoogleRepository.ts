import type {
    GoogleRefreshToken,
    GoogleUser,
} from "../../../shared/domains/AuthContract.ts";
import { prisma } from "../../../shared/libs/prisma.ts";

export class GoogleRepository {
    async findOrCreate(user: Pick<GoogleUser, "email" | "name">) {
        const { email, name } = user;

        let profile = await prisma.googleUser.findUnique({
            where: { email },
        });

        if (!profile) {
            profile = await prisma.googleUser.create({
                data: {
                    email,
                    name,
                },
            });
        }

        return profile;
    }

    async storeRefreshToken(
        token: string,
        userId: number,
    ) {
        try { 
            return prisma.googleRefreshToken.upsert({
                where: { userId },
                update: { refreshToken: token},
                create: { 
                    refreshToken: token,
                    userId,
                    tokenId: crypto.randomUUID(),
                },
            });
        }catch( err ) {
            console.error("Error storing refresh token: ", err);
            throw err;
        } 
        
    }
}
