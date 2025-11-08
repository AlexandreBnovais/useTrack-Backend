import { FollowUpRepository } from "../repositories/followupRepository.ts";
import { LeadService } from "../../Leads/services/leadService.ts";
import type { FollowUp } from "@prisma/client";

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
        const interactionLog = await this.repository.create({
            leadId,
            registeredById,
            notes: `[INTERAÇÃO REALIZADA] ${interactionNotes}`,
            date: new Date(),
            isCompleted: true,
        });

        const nextFollowUp = await this.repository.create({
            leadId,
            registeredById,
            notes: `[PROXIMA AÇÃO] ${nextActionDate}`,
            date: nextActionDate,
            isCompleted: false,
        });

        await this.leadService.setNextFollowUpDate(leadId, nextActionDate);
        return { log: interactionLog, next: nextFollowUp };
    }

    async getPendingFollowUps(sellerId: string): Promise<FollowUp[]> {
        return this.repository.findPendingBySeller(sellerId);
    }
}
