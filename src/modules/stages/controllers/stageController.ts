import { Request, Response } from "express";
import { prisma } from "../../../shared/libs/prisma";

class StageController { 
    async findAllStages(req: Request, res: Response) {
        try {
            const stages = await prisma.salesFunnelStage.findMany({ 
                orderBy: {
                    order: 'asc',
                },

                select: {
                    id: true,
                    name: true,
                    order: true,
                    isClosed: true,
                }
            })

            return res.status(200).json(stages);
        }catch(error) { 
            console.error("Erro ao buscar estágios: ", error);
            return res.status(500).json({ message: "Erro interno ao buscar estágios."});
        }
    }
}

export default new StageController();