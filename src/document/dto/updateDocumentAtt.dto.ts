import { IsNotEmpty } from 'class-validator';

export class UpdateDocumentAttDTO {
    @IsNotEmpty()
    public documentID: string
    @IsNotEmpty()
    public attributes: Array<{content: any, expiresDate: Date, attributeID: string, expired: boolean }>
}