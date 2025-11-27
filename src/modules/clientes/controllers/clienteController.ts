// src/modules/clients/client.controller.ts
import type { Request, Response } from "express";
import { ClientService } from "../services/clientService";
import type {
    CreateClientBody,
    UpdateClientBody,
} from "../../../shared/domains/ClientContract";

class ClientController {
    private clientService: ClientService;

    constructor() {
        this.clientService = new ClientService();
        // **Binding** dos métodos
        this.create = this.create.bind(this);
        this.list = this.list.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    /**
     * POST /api/clients
     * Cria clientes
     */
    async create(
        req: Request<{}, {}, CreateClientBody>,
        res: Response,
    ): Promise<Response> {
        try {
            const { email, name, contactName, phone } = req.body;

            if (!email || !name) {
                return res.status(400).json({
                    message: "Dados obrigatorios faltando",
                });
            }

            const newClient = await this.clientService.createClient({
                name,
                email,
                phone,
                contactName,
            });

            return res.status(201).json(newClient);
        } catch (err) {
            console.error("Erro ao listar clientes:", err);
            return res.status(500).json({
                message: "Erro interno ao listar clientes.",
                details:
                    err instanceof Error
                        ? err.message
                        : "Erro interno ao servidor",
            });
        }
    }

    /**
     * GET /api/clients
     * Lista todos os clientes.
     */
    async list(req: Request, res: Response): Promise<Response> {
        try {
            const clients = await this.clientService.getClientes();
            return res.status(200).json(clients);
        } catch (error) {
            console.error("Erro ao listar clientes:", error);
            return res.status(500).json({
                message: "Erro interno ao listar clientes.",
                details:
                    error instanceof Error
                        ? error.message
                        : "Erro interno ao servidor",
            });
        }
    }

    /**
     * GET /api/clients/:id
     * Busca um cliente por ID.
     */
    async getById(
        req: Request<{ id: string }>,
        res: Response,
    ): Promise<Response> {
        try {
            const { id } = req.params;
            const client = await this.clientService.getClientById(id);
            return res.status(200).json(client);
        } catch (error) {
            console.error("Erro ao buscar cliente:", error);
            if (error instanceof Error) {
                if (error.message.includes("não encontrado")) {
                    return res.status(404).json({ message: error.message });
                }
            }
            return res.status(500).json({
                message: "Erro interno ao buscar cliente.",
                details:
                    error instanceof Error
                        ? error.message
                        : "Erro interno ao servidor",
            });
        }
    }

    /**
     * PUT /api/clients/:id
     * Atualiza dados de um cliente.
     */
    async update(
        req: Request<{ id: string }, {}, UpdateClientBody>,
        res: Response,
    ): Promise<Response> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const updatedClient = await this.clientService.updateClient(
                id,
                updateData,
            );

            return res.status(200).json(updatedClient);
        } catch (error) {
            console.error("Erro ao atualizar cliente:", error);
            if (error instanceof Error) {
                if (error.message.includes("já está em uso")) {
                    return res.status(409).json({ message: error.message }); // 409 Conflict
                }
                if (error.message.includes("não encontrado")) {
                    return res.status(404).json({ message: error.message });
                }
            }
            return res.status(500).json({
                message: "Erro interno ao atualizar cliente.",
                details:
                    error instanceof Error
                        ? error.message
                        : "Erro interno no servidor",
            });
        }
    }

    /**
     * DELETE /api/clients/:id
     * Deleta um cliente com checagem de Leads ativas.
     */
    async delete(
        req: Request<{ id: string }>,
        res: Response,
    ): Promise<Response> {
        try {
            const { id } = req.params;

            await this.clientService.deleteClient(id);

            return res.status(204).send(); // 204 No Content
        } catch (error) {
            console.error("Erro ao deletar cliente:", error);
            if (error instanceof Error) {
                if (error.message.includes("não é possível deletar")) {
                    return res.status(409).json({ message: error.message }); // 409 Conflict
                }
                if (error.message.includes("não encontrado")) {
                    return res.status(404).json({ message: error.message });
                }
            }
            return res.status(500).json({
                message: "Erro interno ao deletar cliente.",
                details:
                    error instanceof Error
                        ? error.message
                        : "Erro interno no servidor",
            });
        }
    }
}

export default new ClientController();
