import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateDocumentCommentDto {
    @ApiProperty({ example: "Please clarify this revenue calculation.", description: "Main comment text" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(5000)
    comment: string;

    @ApiPropertyOptional({ example: "block-abc123", description: "Editor block identifier" })
    @IsOptional()
    @IsString()
    blockId?: string;

    @ApiPropertyOptional({ example: "cmt_xxxxxxxxx", description: "Parent comment ID (for replies)" })
    @IsOptional()
    @IsString()
    parentId?: string;
}