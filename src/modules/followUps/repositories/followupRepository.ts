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


export type UpdateFollowUpData = Partial<Omit<CreateFollowUpData, 'leadId'>> & {
    // Campos que podem ser atualizados
    notes?: string;
    isCompleted?: boolean;
    data?: Date;
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

    async findOne(followUpId: string, sellerId: string) {
        return prisma.followUp.findUnique({ 
            where: {
                id: followUpId,
                lead: {
                    sellerId: sellerId
                }
            },

            include: { lead: true }
        })
    }

    async findPendingBySellerAndLead(sellerId: string, leadId: string): Promise<FollowUp[]> {

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        return prisma.followUp.findMany({
            where: {
                isCompleted: false,
                data: { 
                    lte: endOfToday
                },

                leadId: leadId,

                lead: {
                  sellerId: sellerId  
                },
            },
            include: { lead: { include: { client: true } } },
            orderBy: { data: "asc" },
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

    async update(updateCriteria: { followUpId: string, sellerId: string }, updateData: UpdateFollowUpData, txClient: TransactionClient = prisma) {
        return txClient.followUp.updateMany({
            where: {
                id: updateCriteria.followUpId,
                // CONDIÇÃO DE SEGURANÇA: Garante que a Lead pai pertence ao sellerId
                lead: {
                    sellerId: updateCriteria.sellerId
                }
            },
            data: {
                data: updateData.data,
                notes: updateData.notes,
                isCompleted: updateData.isCompleted
            }
        });
    }
    
    async delete(followUpId: string, sellerId: string) {
        return prisma.followUp.deleteMany({
            where: {
                id: followUpId,
                // Garante que o Follow-up só será excluído se a Lead for do vendedor
                lead: {
                    sellerId: sellerId
                }
            }
        });
    }

    async complete(id: string, txClient: TransactionClient): Promise<FollowUp> {
        return txClient.followUp.update({
            where: { id },
            data: { isCompleted: true },
        });
    }
}
