import { Request, Response } from 'express';
import { IdDoesNotExist } from '../datastore/utils';

export class UnauthorizedError extends Error {
    constructor(route, userId) {
        super(userId);
        this.message = `user_id  ${userId}, not authorized for route ${route}`;
    }
}

// these error handlers will return the appropriate http status code
export function return401OnUnauthorizedError(f: (req: Request, res: Response, next) => any) {
    return async (req: Request, res: Response, next) => {
        try {
            const result = await f(req, res, next);
            return result;
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                const errorMessage = `${error}`;
                res.statusMessage = errorMessage;
                res.clearCookie('commonspacejwt');
                res.status(401).send({ error_message: errorMessage });
                return;
            }
            throw error;
        }
    };
}

export function return404OnIdDoesNotExist(f: (req: Request, res: Response, next) => any) {
    return async (req: Request, res: Response, next) => {
        try {
            const result = await f(req, res, next);
            return result;
        } catch (error) {
            if (error instanceof IdDoesNotExist) {
                const errorMessage = `${error}`;
                res.statusMessage = errorMessage;
                res.status(404).send({ error_message: errorMessage });
                return;
            }
            throw error;
        }
    };
}
