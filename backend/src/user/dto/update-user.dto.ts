import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({ example: "Animesh", description: 'User First Name', })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    firstName?: string;

    @ApiProperty({ example: "Pradhan", description: 'User Last Name' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    lastName?: string;

    // @ApiProperty({ example: "", description: 'User Name' })
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    mobileNo?: string;

    // ❌ deliberately NOT included:
    // password
    // role
    // verification flags
}