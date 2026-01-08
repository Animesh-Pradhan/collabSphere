import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {

    @ApiProperty({ example: "dr.illuminati.06@gmail.com", description: 'User email address', })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "animesh", description: "User Password", minLength: 6 })
    @IsNotEmpty()
    password: string;
}
