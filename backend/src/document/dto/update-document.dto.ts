import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsObject } from "class-validator";

export class UpdateDocumentDto {

    @ApiPropertyOptional({ example: "Updated Title" })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ example: "Updated description" })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: { type: "doc", content: [] }, description: "Updated content snapshot" })
    @IsObject()
    content: Record<string, any>;
}
