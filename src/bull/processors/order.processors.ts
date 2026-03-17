// src/bull/processors/order.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { HttpException, Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('order-queue')
export class OrderProcessor {
    private readonly logger = new Logger(OrderProcessor.name);
    constructor(
        // private readonly orderService: OrderService
    ) { }
    @Process('place-order') // name job
    async handlePlaceOrder(job: Job, token?: string) {
        try {
            // await this.orderService.implementsOrder(job.data)

            return { status: 'ok' };
        } catch (error) {
            this.logger.error(`❌ Job ${job.id} failed (attempt ${job.attemptsMade + 1}):`, error.message);
            if (error instanceof HttpException) {
                const status = error.getStatus();
                const response = error.getResponse();
                this.logger.error(`Order failed: ${status} - ${JSON.stringify(response)}`);
                throw error;
            }
            throw new Error('Error from job =>', error);
        }
    }
}