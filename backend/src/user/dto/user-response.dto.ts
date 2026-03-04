import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class UserInsideMembershipDto {

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

@Exclude()
export class UserResponseDto {
    @Expose()
    id: string;

    @Expose()
    role: string;

    @Expose()
    status: string;

    @Expose()
    joinedAt: Date;

    @Expose()
    @Type(() => UserInsideMembershipDto)
    user: UserInsideMembershipDto;
}