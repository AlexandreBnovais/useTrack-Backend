import type { GoogleUser } from "@prisma/client";
import { prisma } from "../../../shared/libs/prisma";

type GoogleUserinput = Omit<
    GoogleUser,
    "id" | "updatedAt" | "createdAt" | "pictureUrl"
>;

export class GoogleRepository {
    async findOrCreate(user: GoogleUserinput) {
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

    async storeRefreshToken(token: string, userId: string) {
        try {
            return prisma.googleRefreshToken.upsert({
                where: { userId },
                update: { refreshToken: token },
                create: {
                    refreshToken: token,
                    userId,
                    tokenId: crypto.randomUUID(),
                },
            });
        } catch (err) {
            console.error("Error storing refresh token: ", err);
            throw err;
        }
    }
}
