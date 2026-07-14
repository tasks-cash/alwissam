import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthUser, AuthedRequest } from "./session.guard";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    return req.authUser as AuthUser;
  },
);
