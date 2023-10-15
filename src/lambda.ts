import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { urlencoded, json } from 'express';
import { AppModule } from './app.module';
import { authorization } from './auth.middleware';

let cachedServer;

export const handler = async (event, context) => {
  if (!cachedServer) {
    const nestApp = await NestFactory.create(AppModule, { cors: true });
    nestApp.use(json({ limit: '50mb' }));
    nestApp.use(urlencoded({ limit: '50mb', extended: true }));
    nestApp.use(authorization);
    await nestApp.init();
    cachedServer = serverlessExpress({
      app: nestApp.getHttpAdapter().getInstance(),
    });
  }

  return cachedServer(event, context);
};
