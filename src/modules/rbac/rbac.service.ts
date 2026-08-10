// src/modules/rbac/rbac.service.ts
import { RolePermissionsRepository } from '@modules/associations/repositories/role-permissions.repository';
import { PermissionsModel } from '@modules/permissions/domain/models/permissions.model';
import { RolesModel } from '@infrastructure/models/roles.model';
import { Injectable } from '@nestjs/common';
import { RedisService } from '@redis/redis.service';

@Injectable()
export class RbacService {
  constructor(
    protected repository: RolePermissionsRepository,
    public cacheManage: RedisService,
  ) { }

  async getPermissionsByRole(role: string): Promise<any> {
    const result = await this.repository.findAllByRaw({
      attributes: ['permission_id', 'role_id'],
      include: [
        {
          model: RolesModel,
          as: 'roles',
          attributes: ['name']
        },
        {
          model: PermissionsModel,
          as: 'permissions',
          attributes: ['resource', 'action']
        },
      ],
      nest: true
    });

    const roleMap = new Map<string, Set<Record<any, any>>>();
    for (const item of result) {
      const roleName = item.roles.name;
      const permission = {
        resource: item.permissions.resource,
        action: item.permissions.action,
      }
      if (!roleMap.has(roleName)) {
        roleMap.set(roleName, new Set()); // Dùng Set để tránh trùng
      }
      roleMap.get(roleName)!.add(permission);
    }
    const rolePermissions = [Object.fromEntries(Array.from(roleMap.entries(), ([role, perms]) => [role, [...perms]]))];
    const permissions = rolePermissions[0][role] || [];

    return permissions;
  }
}
