import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { ApiToken } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

import { PrismaService } from "src/services/prisma/prisma.service";

@Injectable()
export class ApiMiddleware implements NestMiddleware {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async use(
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response<{ errorMessage: string; }> | void> {
        const { authorization } = request.headers;

        if(authorization === undefined || authorization === null) {
            return response.status(HttpStatus.UNAUTHORIZED).send({
                errorMessage: "Missing authorization key."
            });
        }

        let foundApiToken: ApiToken | null = null;

        try {
            foundApiToken = await this.prismaService.apiToken.findFirst({ where: { token: authorization } });
        } catch(error) {
            console.error(`Error in ApiMiddleware - failed to get api token from database: ${error}`);
        }

        if(foundApiToken === null) {
            return response.status(HttpStatus.UNAUTHORIZED).send({
                errorMessage: "Invalid API Token."
            });
        }

        next();
    }
}