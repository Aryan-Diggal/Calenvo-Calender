import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // Next.js default port
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001); // Run backend on 3001 since frontend will be 3000
}
bootstrap();
