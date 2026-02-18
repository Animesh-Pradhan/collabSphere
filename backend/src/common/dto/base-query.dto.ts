import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsIn, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BaseQueryDto {

    @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ description: 'Number of records per page', example: 20, default: 20, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit: number = 20;

    @ApiPropertyOptional({ description: 'Field name to sort by', example: 'createdAt', default: 'createdAt' })
    @IsOptional()
    @IsString()
    sortBy: string = 'createdAt';

    @ApiPropertyOptional({ description: 'Sorting order', example: 'desc', enum: ['asc', 'desc'], default: 'desc' })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    order: 'asc' | 'desc' = 'desc';

    @ApiPropertyOptional({ description: 'Search keyword', example: 'Animesh' })
    @IsOptional()
    @IsString()
    search?: string;


    @ApiPropertyOptional({ description: 'Filter records from this date (ISO format)', example: '2025-01-01' })
    @IsOptional()
    @IsDateString()
    fromDate?: string;

    @ApiPropertyOptional({ description: 'Filter records up to this date (ISO format)', example: '2025-02-01' })
    @IsOptional()
    @IsDateString()
    toDate?: string;
}
