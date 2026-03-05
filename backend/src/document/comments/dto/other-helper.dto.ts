import { BaseQueryDto } from "src/common/dto/base-query.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class GetDocumentCommentsQueryDto extends BaseQueryDto {
    @ApiPropertyOptional({ description: "Filter by blockId" })
    @IsOptional()
    @IsString()
    blockId?: string;

    @ApiPropertyOptional({ description: 'Filter resolved threads', example: false })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    resolved?: boolean;
}