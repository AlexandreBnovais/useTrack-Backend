import type { Lead } from "@prisma/client";
import { prisma } from "../../../shared/libs/prisma.ts";

type CreateLeadData = Omit<Lead, "id" | "createdAt" | "updatedAt">;
type updateLeadData = Partial<CreateLeadData>;

export class LeadRepository {
    async create(data: CreateLeadData): Promise<Lead> {
        return prisma.lead.create({
            data,
            include: { seller: true, client: true, stage: true },
        });
    }

    async findById(id: string) {
        return prisma.lead.findUnique({
            where: { id },
            include: {
                seller: true,
                client: true,
                stage: true,
                followUps: {
                    orderBy: { data: "desc" },
                },
            },
        });
    }

    async findAll(stageId?: number, sellerId?: string): Promise<Lead[]> {
        return prisma.lead.findMany({
            where: {
                ...(stageId && { stageId }),
                ...(sellerId && { sellerId }),
            },
            include: { seller: true, client: true, stage: true },
            orderBy: { createdAt: "desc" },
        });
    }

    async update(id: string, data: updateLeadData): Promise<Lead> {
        return prisma.lead.update({
            where: { id },
            data,
            include: { seller: true, client: true, stage: true },
        });
    }

    async delete(id: string): Promise<Lead> {
        return prisma.lead.delete({
            where: { id },
        });
    }
}
