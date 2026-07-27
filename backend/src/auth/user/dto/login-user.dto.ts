import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {

    @ApiProperty({ example: "animesh.pradhan6666@gmail.com", description: 'User email address', })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: "Animesh@123", description: "User Password", minLength: 6 })
    @IsNotEmpty()
    password!: string;
}
