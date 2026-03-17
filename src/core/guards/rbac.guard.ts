import { TokenSecretResolver } from '@modules/auth/interface/tokenSecret.interface';
import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RedisContext } from '@redis/enums/redis-key.enum';
import { buildRedisKeyQuery } from '@redis/helpers/redis-key.helper';
import { RedisService } from '@redis/redis.service';
import { RESOURCE_KEY } from '@core/decorators/resource.decorator';
import { ACTION_KEY } from '@core/decorators/action.decorator';
import { RbacService } from '@modules/rbac/rbac.service';

@Injectable()
export class RbacGuard implements CanActivate {
    private readonly logger = new Logger(RbacGuard.name);
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
        @Inject('TokenSecretResolver')
        private readonly tokenSecretResolver: TokenSecretResolver,
        private readonly cacheManager: RedisService,
        private readonly rbacService: RbacService,

    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const session_id = request.user.session_id;
        if (!session_id) {
            throw new UnauthorizedException('No session_id provided');
        }
        const redisKey = buildRedisKeyQuery('auth', RedisContext.SESSION, {}, session_id);
        const cache = await this.cacheManager.get(redisKey);
        const rolesCache = JSON.parse(cache).roles;

        if (!cache) {
            throw new UnauthorizedException('Session expired or invalid');
        }

        const resource = this.reflector.getAllAndOverride<string>(RESOURCE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const action = this.reflector.getAllAndOverride<string>(ACTION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const mergePermissions: any[] = [];
        
        for (const role of rolesCache) {
            const permissions: any[] = await this.rbacService.getPermissionsByRole(role);
            mergePermissions.push(...permissions);
        }
        
        if (!resource || !action) throw new ForbiddenException(`Forbidden: Missing defined permission [${resource}.${action}]`);
        
        const hasResource = mergePermissions.some((p: any) => resource.includes(p.resource));
        const hasAction = mergePermissions.some((p: any) => action.includes(p.action));
        
        if (!hasResource || !hasAction) throw new ForbiddenException(`Forbidden: Missing permission [${resource}.${action}]`);

        return true;
    }
}