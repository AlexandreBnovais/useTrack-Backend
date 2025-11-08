export interface CreateClientBody {
    email: string;
    name: string;
    contactName: string;
    phone: string   
}

export interface UpdateClientBody {
    name?: string;
    email?: string;
    contactName?: string;
    phone?: string;
}