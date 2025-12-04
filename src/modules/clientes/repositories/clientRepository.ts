import { prisma } from "../../../shared/libs/prisma";
import type { Client } from "@prisma/client";

type CreateClientData = Pick<
    Client,
    "name" | "email" | "contactName" | "phone" | "sellerId"
>;
type UpdateClientData = Partial<CreateClientData>;

export class ClientRepository {
    async create(data: CreateClientData): Promise<Client> {
        return prisma.client.create({ data });
    }

    async findAll(sellerId: string): Promise<Client[]> {
        return prisma.client.findMany(
            {
                where: { sellerId: sellerId},
                orderBy: { name: "asc"}
            }
        );
    }

    async findById(id: string, sellerId: string): Promise<Client | null> {
        return prisma.client.findUnique({ where: { id: id, sellerId: sellerId } });
    }

    async findByEmail(email: string): Promise<Client | null> {
        return prisma.client.findUnique({ where: { email } });
    }

    async update(id: string, sellerId: string, data: UpdateClientData): Promise<Client> {
        return prisma.client.update({ where: { id: id, sellerId: sellerId }, data });
    }

    async delete(id: string, sellerId: string): Promise<Client> {
        return prisma.client.delete({ where: { id: id, sellerId: sellerId } });
    }
}
