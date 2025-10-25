import { AuthenticationController } from "./AuthenticateController.ts";

const Auth = new AuthenticationController();

export const index = {
    Auth,
};
