import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/update-auth.dto';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateToken;
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
    getMe(id: number): Promise<{
        id: number;
        email: string;
        name: string;
        createdAt: Date;
    }>;
}
