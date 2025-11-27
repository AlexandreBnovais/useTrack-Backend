import type { Response } from "express";
import { ProfileService } from "../services/user.service";
import { type AuthenticatedRequest } from "../../../shared/middlewares/AuthMiddleware";

class ProfileController {
    private profileService: ProfileService;

    constructor() { 
        this.profileService = new ProfileService();
        this.getMe = this.getMe.bind(this);
        this.updateMe = this.updateMe.bind(this);
        this.deleteMe = this.deleteMe.bind(this);
    }

    async getMe(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const userId = req.userId;

            if(!userId) {
                return res.status(401).json({ message: "Token de usuário inválido"});
            }

            const profile = await this.profileService.getUserProfile(userId);

            if(!profile) {
                return res.status(404).json({ message: "Perfil de usuário não encontrado."});
            }

            return res.status(200).json({ 
                message: "Dados do usuário recuperados com sucesso.",
                data: profile
            });
        }catch(error) {
            console.error("Erro ao obter perfil de usuário: ", error);
            return res.status(500).json({ 
                message: "Erro interno ao processar o perfil",
                details: error instanceof Error ? error.message : "Erro desconhecido"
            })
        }
    }

    async updateMe(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try { 
            const userId = req.userId;

            if(!userId) { 
                return res.status(401).json({ 
                    message: "Token de autenticação inválido ou ausente."
                })
            }
            const updateData = req.body;

            const updateProfile = await this.profileService.updateProfile(userId, updateData);

            return res.status(200).json({ 
                message: "Perfil atualizado com sucesso",
                data: updateProfile
            })
        }catch(error) {
            console.log("Erro ao atualizar perfil: ", error);

            if(error instanceof Error) {
                const status = error.message.includes('Não é permitido')? 400 : 500
                return res.status(status).json({ message: error.message});
            }

            return res.status(500).send();
        }
    }

    /**
     * DELETE /api/profile/me
     * Deleta a conta do usuário logado.
     */

    async deleteMe(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const userId = req.userId;

            console.log(userId);

            if(!userId) {
                return res.status(401).json({ message: "Token de autenticação inválido ou ausente."});
            }

            await this.profileService.deleteProfile(userId);

            return res.status(204).send(); 

        } catch (error) {
            console.error("Erro ao deletar perfil:", error);
            return res.status(500).json({ 
                message: "Falha ao deletar a conta.",
                details: error instanceof Error ? error.message : "Erro desconhecido."
            });
        }
    }
}

export default new ProfileController();