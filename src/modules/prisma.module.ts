import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../services/prisma/prisma.service';

@Global() // Makes PrismaService available globally
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
