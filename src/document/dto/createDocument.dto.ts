import { IsNotEmpty } from 'class-validator';

export class CreateDocumentDTO {
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  readonly size: number;

  @IsNotEmpty()
  readonly fileType: string;

  @IsNotEmpty()
  readonly hash: string;

  @IsNotEmpty()
  public author: string;

  @IsNotEmpty()
  public extraMetadata: {}

  public description: string;

  public attributes: object[]
}

// export class UpdateDocumentDTO {
//   @IsNotEmpty()
//   readonly documentID: string;

//   @IsNotEmpty()
//   public name: string;

//   @IsNotEmpty()
//   public size: number;

//   @IsNotEmpty()
//   public fileType: string;
  
//   @IsNotEmpty()
//   public hash: string;

//   @IsNotEmpty()
//   public author: string;

//   public description: string;

//   @IsNotEmpty()
//   public extraMetadata: {}
// }