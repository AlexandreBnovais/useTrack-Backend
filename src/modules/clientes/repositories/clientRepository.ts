import { prisma } from "../../../shared/libs/prisma";
import type { Client } from "@prisma/client";

type CreateClientData = Pick<
    Client,
    "name" | "email" | "contactName" | "phone"
>;
type UpdateClientData = Partial<CreateClientData>;

export class ClientRepository {
    async create(data: CreateClientData): Promise<Client> {
        return prisma.client.create({ data });
    }

    async findAll(): Promise<Client[]> {
        return prisma.client.findMany({ orderBy: { name: "asc" } });
    }

    async findById(id: string): Promise<Client | null> {
        return prisma.client.findUnique({ where: { id } });
    }

    async findByEmail(email: string): Promise<Client | null> {
        return prisma.client.findUnique({ where: { email } });
    }

    async update(id: string, data: UpdateClientData): Promise<Client> {
        return prisma.client.update({ where: { id }, data });
    }

    async delete(id: string): Promise<Client> {
        return prisma.client.delete({ where: { id } });
    }
}
