export class BaseGetResponse<T = any> {
  items?: T;
  totalRecord?: number;
}


export interface IBaseResponse<T> {
    statusCode: number;
    message: string;
    records: T;
}
export interface IBaseSearchParams {
  page?: number;
  limit?: number;
  sortOrder?: 'ASC' | 'DESC'
  sortBy?: string;
  [key: string]: any;
}

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  totalRecord: number
}

export interface ICreated{
  created_at?: Date;
  created_by?: string;
}
export interface IUpdated{
  updated_at?: Date;
  updated_by?: string;
}