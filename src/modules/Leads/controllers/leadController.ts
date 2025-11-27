import type { Request, Response } from "express";
import { LeadService } from "../services/leadService";
import type {
    changeStageBody,
    CreateLeadBody,
    UpdateLeadBody,
} from "../../../shared/domains/leadContract";
import type {
    AuthenticatedRequest,
    ListLeadsQuery,
} from "../../../shared/middlewares/AuthMiddleware";

class LeadController {
    private leadService: LeadService;

    constructor() {
        this.leadService = new LeadService();

        this.list = this.list.bind(this);
        this.create = this.create.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.changeStage = this.changeStage.bind(this);
    }

    // POST /api/leads
    // Cria uma nova lead
    async create(
        req: AuthenticatedRequest<{}, {}, CreateLeadBody>,
        res: Response,
    ) {
        try {
            const { title, value, clientEmail, initialStageId } = req.body;

            const sellerId = req.userId;

            if (!sellerId) {
                return res.status(401).json({
                    message: "Vendedor não autenticado.",
                });
            }

            if (!title || !clientEmail || !initialStageId) {
                return res.status(400).json({
                    message: `Dados obrigatorios faltando ${title || clientEmail || initialStageId}. `,
                });
            }

            const newLead = await this.leadService.createLead({
                title,
                value,
                sellerId: sellerId,
                clientEmail,
                initialStageId,
            });

            return res.status(201).json(newLead);
        } catch (err) {
            console.error("Erro ao criar Lead: ", err);
            const errorMessage =
                err instanceof Error ? err.message : "Erro interno ao servidor";
            if (
                errorMessage.includes("não encontrado") ||
                errorMessage.includes("não existe")
            ) {
                return res.status(400).json({
                    message: errorMessage,
                });
            }
            return res.status(500).json({
                message: "Erro interno ao criar Lead.",
                details: errorMessage,
            });
        }
    }

    async list(
        req: AuthenticatedRequest<{}, {}, {}, ListLeadsQuery>,
        res: Response,
    ): Promise<Response> {
        try {
            const stageId = req.query.stageId
                ? parseInt(req.query.stageId as string)
                : undefined;
            const sellerId = req.userId;
            if (!sellerId) {
                return res
                    .status(401)
                    .json({ message: "Usuario não autenticado" });
            }

            const leads = await this.leadService.getLeads(stageId, sellerId);
            return res.status(200).json(leads);
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: "Erro interno ao listar leads",
                details:
                    err instanceof Error
                        ? err.message
                        : "Erro interno ao servidor",
            });
        }
    }

    /**
     * PUT /api/leads/:id/stage
     * Atualiza o estagio de um lead
     */

    /**
     * GET /api/leads/:id
     * Busca uma Lead por ID.
     */

    async getById(
        req: Request<{ id: string }>,
        res: Response,
    ): Promise<Response> {
        try {
            const { id } = req.params;
            const lead = await this.leadService.getLeadById(id);

            return res.status(200).json(lead);
        } catch (err) {
            console.error("Erro ao buscar Lead: ", err);
            if (err instanceof Error) {
                if (err.message.includes("Não encontrado")) {
                    return res.status(404).json({ message: err.message });
                }
            }
            return res.status(500).json({
                message: "Erro interno ao buscar Lead.",
                details:
                    err instanceof Error
                        ? err.message
                        : "Erro interno ao servidor",
            });
        }
    }

    /**
     * PUT /api/leads/:id
     * Atualiza dados gerais de uma Lead (exceto estágio/follow-up date).
     */

    async update(
        req: Request<{ id: string }, {}, UpdateLeadBody>,
        res: Response,
    ) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    message: "Corpo da requisição vazio.",
                });
            }
            const updateLead = await this.leadService.updateLead(
                id,
                updateData,
            );

            return res.status(200).json(updateLead);
        } catch (err) {
            console.error("Erro ao atualizar lead: ", err);
            if (err instanceof Error) {
                if (err.message.includes("Não encontrado")) {
                    return res.status(404).json({ message: err.message });
                }
            }

            return res.status(500).json({
                message: "Erro interno ao atualizar Lead.",
                details:
                    err instanceof Error
                        ? err.message
                        : "Erro interno ao servidor",
            });
        }
    }

    /**
     * DELETE /api/leads/:id
     * Delete uma Lead.
     */

    async delete(req: Request<{ id: string }>, res: Response) {
        try {
            const { id } = req.params;

            await this.leadService.deleteLead(id);

            return res.status(204).send();
        } catch (err: any) {
            console.error("Erro ao deletar Lead: ", err);
            if (err.code === "P2025") {
                return res.status(404).json({
                    message: `Lead com ID não encontrada para delegação.`,
                });
            }

            return res.status(500).json({
                message: "Erro interno ao deletar Lead.",
                details: err.message,
            });
        }
    }

    async changeStage(
        req: Request<{ id: string }, {}, changeStageBody>,
        res: Response,
    ): Promise<Response> {
        try {
            const { id } = req.params;
            const { newStageId } = req.body;

            if (!newStageId) {
                return res
                    .status(400)
                    .json({ message: "O ID do novo estágio é obrigatorio." });
            }

            const updateLead = await this.leadService.changeStage(
                id,
                newStageId,
            );

            return res.status(200).json(updateLead);
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: "Erro interno ao mudar estagio",
            });
        }
    }
}

export default new LeadController();
