import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class SwitchOrganisationDto {
    @ApiPropertyOptional({ description: 'Organisation ID to switch into. Leave empty for personal workspace.' })
    @IsOptional()
    @IsString()
    orgId?: string;
}