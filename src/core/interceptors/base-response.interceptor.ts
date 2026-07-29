import { IBaseResponse } from "@shared/interface/common";
import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { POSTGRES_ERROR_CODES, POSTGRES_ERROR_HTTP_STATUS } from "../enum/pg-error-codes.enum";

const errorCode = [
    POSTGRES_ERROR_CODES.INVALID_TEXT_REPRESENTATION,
    POSTGRES_ERROR_CODES.NUMERIC_VALUE_OUT_OF_RANGE,
    POSTGRES_ERROR_CODES.STRING_DATA_RIGHT_TRUNCATION,
    POSTGRES_ERROR_CODES.DIVISION_BY_ZERO,
    POSTGRES_ERROR_CODES.DATETIME_FIELD_OVERFLOW,
    POSTGRES_ERROR_CODES.UNIQUE_VIOLATION,
    POSTGRES_ERROR_CODES.UNDEFINED_TABLE,
    POSTGRES_ERROR_CODES.UNDEFINED_COLUMN,
    POSTGRES_ERROR_CODES.NOT_NULL_VIOLATION,
    POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION
]

@Injectable()
export class BaseResponseInterceptor<T> implements NestInterceptor<T, IBaseResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<IBaseResponse<T>> | Promise<Observable<IBaseResponse<T>>> {
        return next
            .handle()
            .pipe(
                map(value => value && ({ ...value })),
                catchError((err) => {
                    if (err instanceof HttpException) {
                        const status = err.getStatus();
                        const errorResponse = err.getResponse();
                        return throwError(() =>
                            new HttpException(
                                {
                                    statusCode: status,
                                    message:
                                        typeof errorResponse === "string"
                                            ? errorResponse
                                            : errorResponse["message"],
                                    timestamp: new Date().toLocaleString(),
                                },
                                status
                            )
                        );
                    } else if (err instanceof TypeError) {
                        return throwError(() =>
                            new HttpException(
                                {
                                    statusCode: HttpStatus.BAD_REQUEST,
                                    message: err.message || 'Bad Request',
                                  timestamp: new Date().toLocaleString(),
                                },
                                HttpStatus.BAD_REQUEST
                            )
                        );
                    }

                    const pgCode = err.parent.code
                    const status = POSTGRES_ERROR_HTTP_STATUS[pgCode] ?? HttpStatus.INTERNAL_SERVER_ERROR;

                    if (errorCode.includes(pgCode)) {
                        return throwError(() => new HttpException(
                            {
                                statusCode: status,
                                message: err.parent.detail || err.message,
                              timestamp: new Date().toLocaleString(),
                            },
                            HttpStatus.CONFLICT
                        ));
                    }

                    return throwError(() => new HttpException(
                        {
                            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                            message: "Internal Server Error",
                          timestamp: new Date().toLocaleString(),
                        },
                        HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    );
                })
            )
    }
}
