import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
    @Expose()
    id: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    email: string;

    @Expose()
    mobileNo: string | null;

    @Expose()
    avatar: string | null;

    @Expose()
    username: string | null;

    @Expose()
    isEmailVerified: boolean;

    @Expose()
    isMobileVerified: boolean;

    @Expose()
    lastLoginAt: Date;

    @Expose()
    signupSource: string;

    @Expose()
    twoFactorAuthentication: boolean;

    @Expose()
    isOnboarded: boolean;

    @Expose()
    onBoardingStep: number;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}
