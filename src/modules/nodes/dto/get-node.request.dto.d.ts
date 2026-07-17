interface DmnNodeFilterParams {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    parentId?: number;
    isActive?: boolean;
    createdBy?: string;
    createdDate?: Date;
    updatedBy?: string;
    updatedDate?: Date;
  }
interface PaginationModel<T> {
    records: T[];
    totalRecords: number;
  }
interface DmnNodeGetVModel {
    id: number;
    userId: string;
    parentId?: number;
    createdDate?: Date;
    createdBy?: string;
    updatedDate?: Date;
    updatedBy?: string;
    isActive: boolean;
    members?: number;
    avatarPath?: string;
    parent?: AspNetUsersGetVModel;
    user?: AspNetUsersGetVModel;
    couples?: DmnCoupleGetVModel[];
}

interface DmnCoupleGetVModel {
    id: number;
    level: number;
    userId: string;
    createdDate?: Date;
    createdBy?: string;
    isActive: boolean;
    nodeId?: number;
    user?: AspNetUsersGetVModel;
}

interface DmnNodeGetAsTree {
    id: number;
    userId: string;
    parentId?: number;
    createdDate?: Date;
    createdBy?: string;
    updatedDate?: Date;
    updatedBy?: string;
    isActive: boolean;
    members?: number;
    children: DmnNodeGetAsTree[];
    user?: AspNetUsersGetVModel;
  }