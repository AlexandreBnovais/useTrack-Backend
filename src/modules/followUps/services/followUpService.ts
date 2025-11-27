import { FollowUpRepository } from "../repositories/followupRepository";
import { LeadService } from "../../Leads/services/leadService";
import type { FollowUp } from "@prisma/client";
import { prisma } from "../../../shared/libs/prisma";

export class FollowUpService {
    private repository: FollowUpRepository;
    private leadService: LeadService;

    constructor() {
        this.leadService = new LeadService();
        this.repository = new FollowUpRepository();
    }

    async logInteractionAndScheduleNext(
        leadId: string,
        registeredById: string,
        interactionNotes: string,
        nextActionDate: Date,
        nextActionNotes: string,
    ): Promise<{ log: FollowUp; next: FollowUp }> {
        const lead = await this.leadService.getLeadById(leadId);
        if (!lead) {
            throw new Error(`Lead com ID ${leadId} não encontrado.`);
        }

        const sellerExists = await prisma.user.count({
            where: { id: registeredById },
        });
        if (sellerExists === 0) {
            throw new Error(
                `Vendedor com ID ${registeredById} não encontrado.`,
            );
        }

        try {
            const result = await prisma.$transaction(async (tx) => {
                const interactionLog = await tx.followUp.create({
                    data: {
                        leadId,
                        registeredById,
                        notes: `[INTERAÇÃO REALIZADA] ${interactionNotes}`,
                        data: new Date(),
                        isCompleted: true,
                    },
                });

                const nextFollowUp = await tx.followUp.create({
                    data: {
                        leadId,
                        registeredById,
                        notes: `[PRÓXIMA AÇÃO] ${nextActionNotes}`,
                        data: nextActionDate,
                        isCompleted: false,
                    },
                });

                await tx.lead.update({
                    where: { id: leadId },
                    data: { nextFollowUpDate: nextActionDate },
                });

                return { log: interactionLog, next: nextFollowUp };
            });

            return result;
        } catch (error) {
            console.error("Transação de FollowUp falhou: ", error);
            throw new Error("Falha ao registrar follow-up e atualizar lead.");
        }
    }

    async getPendingFollowUps(sellerId: string): Promise<FollowUp[]> {
        return this.repository.findPendingBySeller(sellerId);
    }
}
