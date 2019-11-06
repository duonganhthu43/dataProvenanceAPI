import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from './shared/pipes/validation.pipe';
import { FabricService } from './fabric/fabric.service';
import { join } from 'path';

async function bootstrap() {
  const appOptions = { cors: true };

  const app = await NestFactory.create(AppModule, appOptions);
  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('api');
  const options = new DocumentBuilder()
    .setTitle('Data Provenance API center')
    .setDescription('Data Provenance')
    .setVersion('1.0')
    .setBasePath('api')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(3004);
  //await FabricService.checkBlockListener()
}
bootstrap();
