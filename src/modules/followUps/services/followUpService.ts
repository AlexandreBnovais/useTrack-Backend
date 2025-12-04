import { FollowUpRepository, UpdateFollowUpData } from "../repositories/followupRepository";
import { LeadService } from "../../Leads/services/leadService";
import type { FollowUp } from "@prisma/client";
import { prisma } from "../../../shared/libs/prisma";

export class FollowUpService {
    private repository: FollowUpRepository;
    private leadService: LeadService;
    private async syncLeadNextFollowUpDate(leadId: string): Promise<void> {
        // 1. Encontra o Follow-up pendente com a data mais antiga (próxima)
        const latestNextAction = await prisma.followUp.findFirst({
            where: { 
                leadId: leadId,
                isCompleted: false,
                data: {
                    gte: new Date() // Apenas datas futuras
                }
            },
            orderBy: { data: 'asc' }, // Ação mais próxima
            select: { data: true }
        });

        const nextDate = latestNextAction ? latestNextAction.data : null;
        
        // 2. Atualiza a Lead
        await prisma.lead.update({
            where: { id: leadId },
            data: { nextFollowUpDate: nextDate }
        });
    }

    constructor() {
        this.leadService = new LeadService();
        this.repository = new FollowUpRepository();
    }

    async logInteractionAndScheduleNext(
        leadId: string,
        registeredById: string,
        interactionNotes: string,
        nextActionDate: Date | null,
        nextActionNotes: string,
    ): Promise<{ log: FollowUp; next: FollowUp | null }> {
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
                let nextFollowUp = null;
                if(nextActionDate) {
                    nextFollowUp = await tx.followUp.create({
                        data: {
                            leadId,
                            registeredById,
                            notes: `[PRÓXIMA AÇÃO] ${nextActionNotes}`,
                            data: nextActionDate,
                            isCompleted: false,
                        },
                    });
                }


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

    async findById(followUpId: string, sellerId: string) {
        const followUp = await this.repository.findOne(followUpId, sellerId);

        if(!followUp) {
            throw new Error(`Follow-up ID ${followUpId} não encontrado.`);
        }

        return followUp;
    }

    async getPendingFollowUps(sellerId: string): Promise<FollowUp[]> {
        return this.repository.findPendingBySeller(sellerId)
    }

    async findPendingBySellerAndLead(sellerId: string, leadId: string) {
        return this.repository.findPendingBySellerAndLead(sellerId, leadId);
    }

    async update(followUpId: string, updateData: UpdateFollowUpData, sellerId: string): Promise<FollowUp> {
        const result = await this.repository.update(
            { followUpId, sellerId },
            updateData
        )

        if(result.count === 0) {
            throw new Error(`Follow-up ID ${followUpId} não encontrado ou não pertence ao vendedor.`);
        }

        const updatedFup = await this.findById(followUpId, sellerId);
        await this.syncLeadNextFollowUpDate(updatedFup.leadId);

        return updatedFup;
    }

    async deleteFollowUp(id: string, sellerId: string) {
        const fupToDelete = await this.findById(id, sellerId); // Usa a busca segura para garantir posse
        const leadId = fupToDelete.leadId;

        const result = await this.repository.delete(id, sellerId);

        if (result.count === 0) {
            // Este erro é improvável se findById não falhou, mas mantemos
            throw new Error(`Follow-up ID ${id} não encontrado ou não pertence ao vendedor.`);
        }
        await this.syncLeadNextFollowUpDate(leadId);
        return result
    };
}
