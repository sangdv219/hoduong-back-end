interface DmnNodeFilterParams {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    fatherId?: number;
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
    fatherId?: number;
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
    couple_order: number;
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
    fatherId?: number;
    createdDate?: Date;
    createdBy?: string;
    updatedDate?: Date;
    updatedBy?: string;
    isActive: boolean;
    members?: number;
    children: DmnNodeGetAsTree[];
    user?: AspNetUsersGetVModel;
  }