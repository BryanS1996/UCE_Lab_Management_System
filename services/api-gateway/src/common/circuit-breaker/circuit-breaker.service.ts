import { Injectable, Logger } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private breakers: Map<string, CircuitBreaker<any, any>> = new Map();

  getBreaker<TI, TO>(
    name: string,
    action: (...args: TI[]) => Promise<TO>,
    options?: CircuitBreaker.Options
  ): CircuitBreaker<TI[], TO> {
    if (!this.breakers.has(name)) {
      const defaultOptions: CircuitBreaker.Options = {
        timeout: 5000, // 5 segundos para expirar
        errorThresholdPercentage: 50, // 50% de fallos abre el circuito
        resetTimeout: 10000, // 10 segundos antes de intentar cerrar
        ...options,
      };

      const breaker = new CircuitBreaker<TI[], TO>(async (...args: TI[]) => {
        return action(...args);
      }, defaultOptions);

      breaker.fallback(() => {
        this.logger.warn(`Circuito abierto (Fast-Fail) para: ${name}`);
        throw new Error(`Servicio ${name} no disponible temporalmente (Circuit Breaker Open)`);
      });

      breaker.on('open', () => this.logger.warn(`Circuit breaker [${name}] OPENED`));
      breaker.on('halfOpen', () => this.logger.log(`Circuit breaker [${name}] HALF-OPENED`));
      breaker.on('close', () => this.logger.log(`Circuit breaker [${name}] CLOSED`));

      this.breakers.set(name, breaker);
    }
    return this.breakers.get(name) as CircuitBreaker<TI[], TO>;
  }
}
