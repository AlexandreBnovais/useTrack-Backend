import { z } from "zod";

export const AuthSchema = z.object({
    nome: z.string(),
    email: z.email({ pattern: z.regexes.email }),
    password: z
        .string()
        .min(6, { message: "Senha deve ter no minimo 6 caracteres" }),
});
