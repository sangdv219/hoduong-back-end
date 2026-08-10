// // src/modules/rbac/rbac.service.ts
// import { Injectable, Logger } from '@nestjs/common';
// import { RedisService } from '@redis/redis.service';
// import { RolePermissionsRepository } from '../associations/repositories/role-permissions.repository';
// import { PermissionsModel } from '../permissions/domain/models/permissions.model';
// import { RolesModel } from '../roles/domain/models/roles.model';

// @Injectable()
// export class RolePermissionsService {
//   private readonly logger = new Logger(RolePermissionsService.name);
//   constructor(
//     protected repository: RolePermissionsRepository,
//     public cacheManage: RedisService,
//   ) { }

//   async getPermissionsByRole(role: string): Promise<any> {
//     const result = await this.repository.findAllByRaw({
//       attributes: ['permission_id', 'role_id'],
//       include: [
//         {
//           model: RolesModel,
//           as: 'roles',
//           attributes: ['name']
//         },
//         {
//           model: PermissionsModel,
//           as: 'permissions',
//           attributes: ['resource', 'action']
//         },
//       ],
//       nest: true
//     });
//     const roleMap = new Map();
//     for (const item of result) {
//       const roleName = item.roles.name;
//       const permissionKey = `${item.permissions.resource}.${item.permissions.action}`;

//       if (!roleMap.has(roleName)) {
//         roleMap.set(roleName, new Set()); // Dùng Set để tránh trùng
//       }
//       roleMap.get(roleName).add(permissionKey);
//     }
//     const cacheKey = `rbac:permissions:${role}`;
//     const data = [Object.fromEntries(Array.from(roleMap, ([role, perms]) => [role, [...perms]]))];
//     const permissions = data[0][role] || [];
//     await this.cacheManage.set(cacheKey, JSON.stringify(data), 'EX', 3600);
    
//     return permissions;

//     // return data;
//   }
// }
