import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();

        return next.handle().pipe(map((response) => ({
            success: true,
            message: response?.message ?? null,
            data: response?.data ?? null,
            timestamp: new Date().toISOString(),
            path: request.url
        })))

    }
}   