import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  constructor(private readonly sequelize: Sequelize) {}

  async onModuleInit() {
    try {
      await this.sequelize.authenticate();
      console.log('✅ OnModuleInit: Database connected successfully');
    } catch (error) {
      console.error('❌ Unable to connect to the database:', error);
    }
  }

  async onApplicationShutdown(signal?: string) {
    await this.sequelize.close();
    console.log(
      `🔥 🔥 🔥 🔥 🔥 onApplicationShutdown called with signal: ${signal} 🔥 🔥 🔥 🔥 🔥`,
    );
  }
}
