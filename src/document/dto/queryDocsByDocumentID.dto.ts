import { IsNotEmpty } from 'class-validator';

export class QuerryDocsByDocumentidDTO {
  @IsNotEmpty()
  readonly documentID: string;
}