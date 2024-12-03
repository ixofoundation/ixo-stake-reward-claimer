import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { urlencoded, json } from 'express';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ limit: '100mb', extended: true }));
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('ixo-payments-nest')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT || 3000);

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    maxValueLength: 5000,
    tracesSampleRate: 1.0,
  });
}
bootstrap();

// patch for bigint to json
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};
