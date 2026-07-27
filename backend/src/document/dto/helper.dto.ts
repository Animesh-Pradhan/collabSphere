import { DocumentStatus } from "generated/prisma/enums";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional } from "class-validator";
import { BaseQueryDto } from "src/common/dto/base-query.dto";
import { Transform } from "class-transformer";
import type { DocumentContent } from "../types";

export class FindAllDocumentsQueryDto extends BaseQueryDto {
    @ApiPropertyOptional({ description: 'Filter by document status', enum: DocumentStatus, example: DocumentStatus.DRAFT })
    @IsOptional()
    @IsEnum(DocumentStatus)
    status?: DocumentStatus;

    @ApiPropertyOptional({ description: "Filter locked documents", example: true })
    @IsOptional()
    @Transform(({ value }) => value === "true")
    locked?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => value === "true")
    favorite?: boolean;
}

export class AutosaveDocumentDto {
    @ApiProperty()
    @IsObject()
    @IsNotEmpty()
    content!: DocumentContent;
}