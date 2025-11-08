import { LeadRepository } from "../Repositories/leadRepository.ts";
import type { Lead } from "@prisma/client";

type UpdateLeadInput = Partial<{
    title: string;
    value: number;
    sellerId: string;
    clientId: string;
}>;

export class LeadService {
    private repository: LeadRepository;
    constructor() {
        this.repository = new LeadRepository();
    }

    async createLead(data: {
        title: string;
        value: number;
        sellerId: string;
        clientId: string;
        initialStageId: number;
    }): Promise<Lead> {
        return await this.repository.create({
            ...data,
            stageId: data.initialStageId,
            nextFollowUpDate: null,
        });
    }

    async getLeads(stageId?: number, sellerId?: string) {
        return await this.repository.findAll(stageId, sellerId);
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
}
