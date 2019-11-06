import { IsNotEmpty } from 'class-validator';

export class UpdateDocumentDTO {

    @IsNotEmpty()
    public documentID: string;
    public name: string;
    public size: number;
    public fileType: string;
    public hash: string;
    public author: string;
    public description: string;
    public extraMetadata: {};
    public updatingNote: string;
}