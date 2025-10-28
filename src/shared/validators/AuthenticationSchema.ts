import { z } from "zod";

export const AuthenticationSchema = z.object({
    nome: z.string().normalize("NFC"),
    email: z.email({ pattern: z.regexes.email }),
    password: z
        .string()
        .min(8, { message: "Senha deve ter no minimo 8 caracteres" }),
});
