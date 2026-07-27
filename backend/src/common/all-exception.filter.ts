import { ArgumentsHost, BadRequestException, Catch, HttpException, HttpStatus } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Request, Response } from "express";
import { Prisma } from "generated/prisma/client";
import { MyLoggerService } from "src/my-logger/my-logger.service";

type MyResponseObj = {
    success: boolean,
    message: string,
    errorCode: string,
    statusCode: number,
    timestamp: string,
    path: string,
    errors: any
}


@Catch()
export class AllExceptionFilter extends BaseExceptionFilter {
    private readonly logger = new MyLoggerService(AllExceptionFilter.name)

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const myResponseObj: MyResponseObj = {
            success: false,
            message: "",
            statusCode: 500,
            errorCode: '',
            timestamp: new Date().toISOString(),
            path: request.url,
            errors: null
        }

        if (exception instanceof HttpException) {
            myResponseObj.statusCode = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                myResponseObj.message = res;
            } else if (typeof res === 'object') {
                myResponseObj.message = (res as any).message;
                myResponseObj.errors = (res as any).errors || null;
            }
        } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            myResponseObj.errorCode = exception.code;
            switch (exception.code) {
                case 'P2002':
                    myResponseObj.statusCode = 409;
                    myResponseObj.message = 'Duplicate value exists';
                    break;

                case 'P2025':
                    myResponseObj.statusCode = 404;
                    myResponseObj.message = 'Record not found';
                    break;

                default:
                    myResponseObj.statusCode = 400;
                    myResponseObj.message = 'Database error';
            }
        } else if (exception instanceof Prisma.PrismaClientValidationError) {
            myResponseObj.statusCode = 422;
            myResponseObj.message = exception.message.replace(/\n/g, '');
        } else if (exception instanceof BadRequestException) {
            const res = exception.getResponse() as any;

            if (Array.isArray(res.message)) {
                myResponseObj.statusCode = 422;
                myResponseObj.message = 'Validation failed';
                myResponseObj.errors = res.message.map((msg: string) => {
                    const [field] = msg.split(' ');
                    return { field, message: msg };
                });
            }
        } else {
            myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR
            myResponseObj.message = 'Internal Server Error'
        }

        response.status(myResponseObj.statusCode).json(myResponseObj);
        this.logger.error(myResponseObj.message, AllExceptionFilter.name);
        super.catch(exception, host);
    }
}