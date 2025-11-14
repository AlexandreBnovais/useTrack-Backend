export interface User {
    id?: string;
    nome?: string;
    email: string;
    password: string;
}

export interface GoogleUser {
    id?: number;
    googleId?: string;
    name: string;
    email: string;
    pictureUrl?: string;
    googleRefreshToken: string;
}

export interface GoogleRefreshToken {
    id?: string;
    tokenId?: string;
    refreshToken?: string;
}
