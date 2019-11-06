import { Module } from '@nestjs/common';
import { FabricModule } from '../fabric/fabric.module';
import { AuthModule } from '../auth/auth.module';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

@Module({
  imports: [FabricModule, AuthModule],
  providers: [DocumentService],
  controllers: [DocumentController]
})
export class DocumentModule { }
