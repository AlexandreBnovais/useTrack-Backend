import { prisma } from "../../../shared/libs/prisma";
import { ClientRepository } from "../repositories/clientRepository";
import type { Client } from "@prisma/client";

type UpdateClientInput = Partial<{
    name: string;
    email: string;
    contactName: string;
    phone: string;
}>;

export class ClientService {
    private repository: ClientRepository;

    constructor() {
        this.repository = new ClientRepository();
    }

    async createClient(data: {
        name: string;
        email: string;
        contactName: string;
        phone: string;
        sellerId: string;
    }): Promise<Client> {
        const existingClient = await this.repository.findByEmail(data.email);
        if (existingClient) {
            throw new Error(
                `O cliente com o email ${data.email} já está cadastrado.`,
            );
        }
        return this.repository.create(data);
    }

    async getClientes(sellerId: string): Promise<Client[]> {
        return this.repository.findAll(sellerId);
    }

    async getClientById(id: string, sellerId: string): Promise<Client> {
        const client = await this.repository.findById(id, sellerId);
        if (!client) {
            throw new Error(`Cliente com ID ${id} não encontrado`);
        }
        return client;
    }

    async updateClient(id: string,sellerId: string, data: UpdateClientInput): Promise<Client> {
        if (Object.keys(data).length === 0) {
            throw new Error("Nenhum dado fornecido para atualização.");
        }

        if (data.email) {
            const existingClient = await this.repository.findByEmail(
                data.email,
            );
            
            if (existingClient && existingClient.id !== id) {
                throw new Error(
                    `O email ${data.email} já está em uso por outro cliente.`,
                );
            }
        }

        return this.repository.update(id, sellerId, data);
    }

    async deleteClient(id: string, sellerId: string): Promise<Client> {
        const activeLeadsCount = await prisma.lead.count({
            where: {
                clientId: id,
                sellerId: sellerId,
                stage: {
                    isClosed: false,
                },
            },
        });

        if (activeLeadsCount > 0) {
            throw new Error(
                `Não é possivel detectar o cliente. Ele possui ${activeLeadsCount} Leads ativas no funil.`,
            );
        }
        try {
            return this.repository.delete(id, sellerId);
        } catch (err: any) {
            if (err.code === "P2025") {
                throw new Error(
                    `Cliente com ID ${id} não encontrado para deleção.`,
                );
            }
            throw err;
        }
    }
}
