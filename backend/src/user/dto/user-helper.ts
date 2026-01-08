import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, MaxLength } from "class-validator";

export class RequestEmailChangeDto {
    @ApiProperty({ example: "dr.illuminati.06@gmail.com", description: 'User Email' })
    @IsString()
    @MaxLength(50)
    email: string;
}

export class RequestMobileChangeDto {
    @ApiProperty({ example: "4578662254", description: 'User Mobile No' })
    @IsString()
    @MaxLength(20)
    mobileNo: string;
}

export class ChangePasswordDto {
    @ApiProperty({ example: "", description: 'Current Password' })
    currentPassword: string;

    @ApiProperty({ example: "", description: 'New Password' })
    newPassword: string;
}

export class VerifyEmailOtpDto {
    @ApiProperty({ example: "", description: 'OTP' })
    @IsString()
    @Length(4, 8)
    otp: string;
}
