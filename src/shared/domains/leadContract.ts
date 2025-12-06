export interface CreateLeadBody {
    title: string;
    value: number;
    sellerId: string;
    clientEmail: string;
    initialStageId: number;
}

export interface changeStageBody {
    stageId?: number;
}

export interface UpdateLeadBody {
    title?: string;
    value?: number;
    sellerId?: string;
    clientEmail?: string;
    stageId?: number;
}
