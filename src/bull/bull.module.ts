import { BullConfigModule } from '@/bull/bullmq.config';
import { Global, Module } from '@nestjs/common';
import { BullService } from '@bull/bull.service';
import { OrderProcessor } from './processors/order.processors';
import { EmailProsessor } from './processors/email.processors';
import { AuthModule } from '@modules/auth/auth.module';

@Global()
@Module({
  imports: [
    BullConfigModule, 
    AuthModule
  ],
  providers: [OrderProcessor, EmailProsessor, BullService],
  exports: [BullService],
})
export class BullModule { }
