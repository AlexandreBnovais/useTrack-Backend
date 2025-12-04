import type { Request, Response } from "express";
import { FollowUpService } from "../services/followUpService";
import type { AuthenticatedRequest } from "../../../shared/middlewares/AuthMiddleware";
import type { LogInteractionBody } from "../../../shared/domains/followupContract";
import { UpdateFollowUpData } from "../repositories/followupRepository";

class FollowUpController {
    private followUpService: FollowUpService;

    constructor() {
        this.followUpService = new FollowUpService();
        this.logAndSchedule = this.logAndSchedule.bind(this);
        this.getFollowUpById = this.getFollowUpById.bind(this);
        this.getPendingFollowUps = this.getPendingFollowUps.bind(this);
        this.deleteManyFollowUps = this.deleteManyFollowUps.bind(this);
    }

    /**
     * POST /api/leads/:leadId/followups
     * Registra a interação atual e agenda a próxima.
     */

    async logAndSchedule(
        req: AuthenticatedRequest<{ leadId: string }, {}, LogInteractionBody>,
        res: Response,
    ) {
        try {
            const { leadId } = req.params;
            const { interactionNotes, nextActionDate, nextActionNotes } =
                req.body;
            const registeredById = req.userId as string;

            // Validação basica
            if (
                !interactionNotes
            ) {
                return res.status(400).json({
                    message: "Notas da interação são obrigatórias.",
                });
            }
            let nextDate: Date | null = null;
            if(nextActionDate) {
                nextDate = new Date(nextActionDate);
                if (isNaN(nextDate.getTime())) {
                    return res.status(400).json({
                        message: "Formato de data inválido para nextActionDate.",
                    });
                }
            }

            const nextNotes = nextActionNotes || '';
            const result =
                await this.followUpService.logInteractionAndScheduleNext(
                    leadId,
                    registeredById,
                    interactionNotes,
                    nextDate,
                    nextNotes
                );

            return res.status(201).json({
                message:
                    "Interação registrada e próximo follow-up agendado com sucesso.",
                data: result,
            });
        } catch (err) {
            console.error("Erro ao registrar Follow-Up: ", err);

            const errorMessage =
                err instanceof Error ? err.message : "Erro interno ao servidor";

            if (errorMessage.includes("Não encontrada")) {
                return res.status(400).json({
                    message: errorMessage,
                });
            }

            return res.status(500).json({
                message: "Erro interno ao processar Follow-Up",
                details: errorMessage,
            });
        }
    }

    async getFollowUpById(req: AuthenticatedRequest<any>, res: Response): Promise<Response> {
        const sellerId = req.userId as string;
        const followUpId  = req.params.followUpId ;
        try {
            const result = await this.followUpService.findById(followUpId, sellerId);
            return res.status(200).json({ 
                data: result
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro interno ao servidor";
            if (err instanceof Error) {
                return res.status(404).json({ message: errorMessage });
            }
            return res.status(500).json({ message: "Erro ao buscar Follow-up", details: errorMessage });
        }

    }

    async getPendingFollowUps(
        req: AuthenticatedRequest<any>,
        res: Response,
    ): Promise<Response> {
        try {
            const sellerId = req.userId;
            const leadId = req.params.leadId as string | undefined;

            if (!sellerId) {
                return res
                    .status(401)
                    .json({ message: "Vendedor não autenticado" });
            }

            let pendingFollowUps;

            if (leadId) {
                // Se leadId está presente, usa a função de serviço que filtra por Lead e Vendedor.
                pendingFollowUps =
                    await this.followUpService.findPendingBySellerAndLead(sellerId, leadId);
            } else {
                // Se leadId não está presente, retorna todos os pendentes do vendedor (lógica original).
                pendingFollowUps =
                    await this.followUpService.getPendingFollowUps(sellerId);
            }

            return res.status(200).json(pendingFollowUps);
        } catch (err) {
            console.error("Erro ao listar follow-ups pendentes: ", err);
            return res.status(500).json({
                message: "Erro interno ao listar follow-ups",
                details:
                    err instanceof Error
                        ? err.message
                        : "Erro interno ao servidor",
            });
        }
    }

    async updateFollowUp(req: AuthenticatedRequest<any>, res: Response): Promise<Response> {
        const sellerId = req.userId as string;
        const followUpId = req.params.followUpId;
        const updateData: UpdateFollowUpData = req.body;

        try {
            if(updateData.data && typeof updateData.data === 'string'){
                const dateObj = new Date(updateData.data);
                if (isNaN(dateObj.getTime())) {
                    return res.status(400).json({ message: "Formato de data inválido." });
                }
                updateData.data = dateObj;
            }

            const updatedFollowUp = await this.followUpService.update(
                followUpId,
                updateData,
                sellerId
            );

            return res.status(200).json({
                message: "Follow-up atualizado com sucesso.",
                data: updatedFollowUp
            });
        }catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro interno ao servidor";
            if (err instanceof Error) {
                 return res.status(404).json({ message: errorMessage });
            }
            return res.status(500).json({ message: "Erro ao atualizar Follow-up", details: errorMessage });
        }
    }

    async deleteManyFollowUps(req: AuthenticatedRequest<any>, res: Response): Promise<Response> {
        const sellerId = req.userId as string;
        const followUpId = req.params.followUpId;

        try {
            await this.followUpService.deleteFollowUp(followUpId, sellerId)
            return res.status(204).send();
        }catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro interno ao servidor";
             if (err instanceof Error) {
                return res.status(404).json({ message: errorMessage });
            }
            return res.status(500).json({ message: "Erro ao excluir Follow-up", details: errorMessage });
        }
    }
}

export default new FollowUpController();
