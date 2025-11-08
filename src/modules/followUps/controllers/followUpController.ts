import type { Request, Response } from "express";
import { FollowUpService } from "../services/followUpService.ts";
import type { AuthenticatedRequest } from "../../../shared/middlewares/AuthMiddleware.ts";

interface LogInteractionBody {
    interactionNotes: string;
    nextActionDate: Date;
    nextActionNotes: string;
    registeredById: string;
}

class FollowUpController {
    private followUpService: FollowUpService;

    constructor() {
        this.followUpService = new FollowUpService();
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
            const {
                interactionNotes,
                nextActionDate,
                nextActionNotes,
            } = req.body;

            const registeredById = req.userId;

            // Validação basica
            if (
                !interactionNotes ||
                !nextActionDate ||
                !nextActionNotes ||
                !registeredById
            ) {
                return res.status(400).json({
                    message: "Todos os campos de follow-up são obrigatorios.",
                });
            }

            const nextDate = new Date(nextActionDate);
            if (isNaN(nextDate.getTime())) {
                return res.status(400).json({
                    message: "Formato de data inválido para nextActionDate.",
                });
            }

            const result =
                await this.followUpService.logInteractionAndScheduleNext(
                    leadId,
                    registeredById,
                    interactionNotes,
                    nextActionDate,
                    nextActionNotes,
                );

            return res.status(201).json({
                message:
                    "Interação registrada e próximo follow-up agendado com sucesso.",
                data: result,
            });
        } catch (err) {
            console.error("Erro ao registrar Follow-Up: ", err);
            return res.status(500).json({
                message: "Erro interno ao processar Follow-Up",
                details:
                    err instanceof Error
                        ? err.message
                        : "Erro interno ao servidor",
            });
        }
    }

    async listPending(
        req: Request<{ sellerId: string }>,
        res: Response,
    ): Promise<Response> {
        try {
            const { sellerId } = req.params;
            const pendingFollowUps =
                await this.followUpService.getPendingFollowUps(sellerId);

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
}

export default new FollowUpController()