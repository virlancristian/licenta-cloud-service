import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from '../config/configuration';
import { PrismaModule } from './prisma.module';
import { ApiMiddleware } from 'src/middleware/api/api.middleware';
import { ImageService } from 'src/services/image/image.service';
import { ImageModule } from './image.module';

@Module({
  imports: [
    ConfigModule.forRoot({
        load: [configuration],
        isGlobal: true
    }),
    PrismaModule,
    ImageModule
  ],
  controllers: [],
  providers: [ImageService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(ApiMiddleware)
    .forRoutes("/*");
  }
}
