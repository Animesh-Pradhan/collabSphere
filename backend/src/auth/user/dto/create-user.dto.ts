import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {

    @ApiProperty({ example: "Animesh", description: 'User First Name', })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    firstName: string;

    @ApiProperty({ example: "Pradhan", description: 'User Last Name', })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    lastName: string;

    @ApiProperty({ example: "dr.illuminati.06@gmail.com", description: 'User email address', })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ example: "6598754125", description: 'User Mobile No', })
    @IsOptional()
    @IsString()
    mobileNo?: string;

    @ApiProperty({ example: "strongPassword123", description: 'User Password', })
    @MinLength(6)
    password: string;

    @ApiProperty({ example: "animesh06", description: 'Username' })
    @IsOptional()
    @IsString()
    username?: string;
}
