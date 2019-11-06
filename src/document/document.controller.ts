import { Controller, UseGuards, UsePipes, Post, Request, Body, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateDocumentDTO } from './dto/createDocument.dto';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { DocumentService } from './document.service';
import { QueryDocByHashDTO } from './dto/queryDocsByHash.dto';
import { UpdateDocumentAttDTO } from './dto/updateDocumentAtt.dto';
import { UpdateDocumentDTO } from './dto/updateDocument.dto';
import { QuerryDocsByDocumentidDTO } from './dto/queryDocsByDocumentID.dto';

@Controller('document')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) { }

    @Post('create')
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ValidationPipe())
    async createNewDocument(@Body() createDocumentDTO: CreateDocumentDTO, @Request() req) {
        return await this.documentService.createNewDocument(createDocumentDTO, req.user)
    }

    @Get('all')
    @UseGuards(AuthGuard('jwt'))
    async getAllDocs(@Request() req) {
        return await this.documentService.getAllDocs(req.user)
    }

    @Post('all/byHash')
    @UseGuards(AuthGuard('jwt'))
    async getDocsByHash(@Body() queryDocByHashDTO: QueryDocByHashDTO, @Request() req) {
        return await this.documentService.getAllDocsByHash(req.user, queryDocByHashDTO.hash)
    }

    @Post('updateAttribute')
    @UseGuards(AuthGuard('jwt'))
    async updateAttribute(@Body() updateAttInfo: UpdateDocumentAttDTO, @Request() req) {
        return await this.documentService.updateAttribute(updateAttInfo, req.user)
    }

    @Post('history/byID')
    @UseGuards(AuthGuard('jwt'))
    async getHistoryByID(@Body() queryByID: QuerryDocsByDocumentidDTO, @Request() req) {
        return await this.documentService.getHistoryByDocumentID(req.user, queryByID.documentID)
    }

    @Post('callback')
    async testWebhookCallbackb(@Body() data: any) {
        console.log('===== my data call back ',data)
        //return await this.documentService.getHistoryByDocumentID(req.user, queryByID.documentID)
    }

    
}
