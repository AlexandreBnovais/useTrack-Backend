import { google } from "googleapis";
import "dotenv/config";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
);

export class GoogleAuthClient {
    getAuthUrl(): string {
        const scopes = [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ];

        return oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: scopes,
            include_granted_scopes: true,
        });
    }

    async exchangeCodeForTokens(
        code: string,
    ): Promise<{ id_token: string; access_token: string }> {
        const { tokens } = await oauth2Client.getToken(code);
        return {
            id_token: tokens.id_token!,
            access_token: tokens.access_token!,
        };
    }

    async getUserInfo(access_token: string) {
        oauth2Client.setCredentials({ access_token });
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: "v2",
        });

        const userInfoResponse = await oauth2.userinfo.get();
        return userInfoResponse.data;
    }
}
