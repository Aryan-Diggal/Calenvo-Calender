import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Not authenticated.');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fallbacksecret';
    
    try {
      const decoded = jwt.verify(token, secret);
      request.user = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Not authenticated.');
    }
  }
}
