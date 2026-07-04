import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { asyncLocalStorage } from './async-context';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.header(CORRELATION_ID_HEADER) || randomUUID();
    
    // Set the correlation id to the request object so it can be accessed by the controller/services
    req.headers[CORRELATION_ID_HEADER] = correlationId;
    
    // Also attach it to the response header
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    
    const store = new Map<string, string>();
    store.set(CORRELATION_ID_HEADER, correlationId);

    asyncLocalStorage.run(store, () => {
      next();
    });
  }
}
