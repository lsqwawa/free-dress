import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly authService;
    constructor(authService: AuthService);
    validate(payload: {
        sub: string;
        phone?: string;
    }): Promise<{
        phone: string;
        nickname: string;
        id: string;
        avatarUrl: string;
        role: import(".prisma/client").$Enums.UserRole;
        userId: string;
    }>;
}
export {};
