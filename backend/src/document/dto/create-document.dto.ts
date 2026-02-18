import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateDocumentDto {
    @ApiProperty({ example: "Product Requirements Document", description: "Title of the document" })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({ example: "Initial draft for Q1 roadmap", description: "Optional short description" })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: { type: "doc", content: [] }, description: "Initial content snapshot (stored in version 1)" })
    @IsObject()
    content: Record<string, any>;

    @ApiPropertyOptional({ example: { tags: ["roadmap", "internal"] }, description: "Optional metadata for filtering or classification" })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}
