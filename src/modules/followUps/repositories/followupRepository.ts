import { prisma } from "../../../shared/libs/prisma.ts";
import type { FollowUp } from "@prisma/client";

type CreateFollowUpData = {
    notes: string;
    leadId: string;
    registeredById?: string;
    isCompleted: boolean;

    date: Date;
};

export class FollowUpRepository {
    async create(data: CreateFollowUpData): Promise<FollowUp> {
        return prisma.followUp.create({
            data,
            include: { lead: true },
        });
    }

    async findPendingBySeller(sellerId: string): Promise<FollowUp[]> {
        return prisma.followUp.findMany({
            where: {
                isCompleted: false,
                lead: {
                    sellerId: sellerId,
                },
                data: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
            include: { lead: { include: { client: true } } },
            orderBy: { data: "asc" },
        });
    }

    async complete(id: string): Promise<FollowUp> {
        return prisma.followUp.update({
            where: { id },
            data: { isCompleted: true },
        });
    }
}
