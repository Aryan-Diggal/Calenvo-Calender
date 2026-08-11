import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/update-auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(createAuthDto: CreateAuthDto): Promise<{
        token: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        token: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
    getMe(req: any): Promise<{
        id: number;
        email: string;
        name: string;
        createdAt: Date;
    }>;
}
