import { prisma } from "../../../shared/libs/prisma.js";
import { LeadRepository } from "../Repositories/leadRepository.js";
import type { Lead, PrismaClient } from "@prisma/client";

type UpdateLeadInput = Partial<{
    title: string;
    value: number;
    sellerId: string;
    clientId: string;
}>;

type TransactionClient = PrismaClient | any;

export class LeadService {
    private repository: LeadRepository;
    constructor() {
        this.repository = new LeadRepository();
    }

    async createLead(data: {
        title: string;
        value: number;
        sellerId: string;
        clientEmail: string;
        initialStageId: number;
    }): Promise<Lead> {
        const { initialStageId, sellerId, clientEmail, ...restOfData } = data;

        const client = await prisma.client.findUnique({
            where: { email: clientEmail },
        });
        if (!client) {
            throw new Error(
                `Cliente com o email ${clientEmail} não encontrado.`,
            );
        }

        const clientId = client.id;

        const sellerExists = await prisma.user.count({
            where: { id: sellerId },
        });
        if (sellerExists === 0) {
            throw new Error(
                `Vendedor com ID ${sellerId} não encontrado. Violação de Foreign Key.`,
            );
        }

        const stageExists = await prisma.salesFunnelStage.count({
            where: { id: initialStageId },
        });
        if (!stageExists) {
            throw new Error(
                `Estagio do funil com ID ${initialStageId} não existe. Violação de Foreign Key`,
            );
        }

        return await this.repository.create({
            ...restOfData,
            sellerId,
            clientId,
            stageId: initialStageId,
            nextFollowUpDate: null,
        });
    }

    async getLeads(stageId?: number, sellerId?: string) {
        return await this.repository.findAll(stageId, sellerId);
    }

    async getLeadById(id: string) {
        const lead = await this.repository.findById(id);
        if (!lead) {
            throw new Error(`Lead com ID ${id} não encontrado.`);
        }
        return lead;
    }

    async updateLead(id: string, data: UpdateLeadInput): Promise<Lead> {
        if (Object.keys(data).length === 0) {
            throw new Error("Nenhum dado fornecido para atualização.");
        }

        return this.repository.update(id, data);
    }

    async deleteLead(id: string) {
        const deletedLead = await this.repository.delete(id);
        return deletedLead;
    }

    async changeStage(leadId: string, newStageId: number): Promise<Lead> {
        const lead = await this.repository.findById(leadId);

        if (!lead) {
            throw new Error("Lead não encontrado.");
        }

        return this.repository.update(leadId, { stageId: newStageId });
    }

    async setNextFollowUpDate(leadId: string, nextDate: Date): Promise<Lead> {
        return this.repository.update(leadId, { nextFollowUpDate: nextDate });
    }
}
