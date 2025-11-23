import { prisma } from "../../../shared/libs/prisma.js";
import type { FollowUp, PrismaClient } from "@prisma/client";

type TransactionClient =
    | PrismaClient
    | Omit<
          PrismaClient,
          | "$connect"
          | "$disconnect"
          | "$on"
          | "$transaction"
          | "$use"
          | "$extends"
      >;

type CreateFollowUpData = {
    notes: string;
    leadId: string;
    registeredById?: string;
    isCompleted: boolean;
    data: Date;
};

export class FollowUpRepository {
    async create(
        data: CreateFollowUpData,
        txClient: TransactionClient = prisma,
    ): Promise<FollowUp> {
        return txClient.followUp.create({
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

    async complete(id: string, txClient: TransactionClient): Promise<FollowUp> {
        return txClient.followUp.update({
            where: { id },
            data: { isCompleted: true },
        });
    }
}
