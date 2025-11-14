export interface CreateLeadBody {
    title: string;
    value: number;
    sellerId: string;
    clientEmail: string;
    initialStageId: number;
}

export interface changeStageBody {
    newStageId: number;
}

export interface UpdateLeadBody {
    title?: string;
    value?: number;
    sellerId?: string;
    clientId?: string;
}
