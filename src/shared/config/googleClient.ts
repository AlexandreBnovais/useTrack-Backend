import { google } from "googleapis";
import crypto from "crypto";
import "dotenv/config";

const oauthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
);

const scope = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
];

const state = crypto.randomBytes(32).toString("hex");

const authorizationUrl = oauthClient.generateAuthUrl({
    access_type: "offline",
    scope: scope,
    state: state,
    response_type: "code",
    include_granted_scopes: true,
});

export { authorizationUrl, oauthClient };
