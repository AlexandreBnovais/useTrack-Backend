import { prisma } from "../../../shared/libs/prisma";
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

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        return prisma.followUp.findMany({
            where: {
                isCompleted: false,
                data: { 
                    lte: endOfToday
                },
                registeredById: sellerId
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
