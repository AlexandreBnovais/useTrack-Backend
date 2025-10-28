import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import "dotenv/config";

const accessTokenSecret = process.env.ACESS_TOKEN_SECRET!;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
    hash: string,
    password: string,
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// JWT TOKENS

export function generateAccessToken(payload: object) {
    return JWT.sign(payload, accessTokenSecret, { expiresIn: "15m" });
}

export function generateRefreshToken(payload: object) {
    return JWT.sign(payload, refreshTokenSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string, type: "access" | "refresh") {
    const secret = type === "access" ? accessTokenSecret : refreshTokenSecret;
    try {
        return JWT.verify(token, secret);
    } catch {
        return null;
    }
}
