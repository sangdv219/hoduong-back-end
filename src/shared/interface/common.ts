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
  page?: number | string;
  limit?: number | string;
  sortOrder?: string;
  [key: string]: any;
}
export interface IPaginationDTO {
  page: number;
  limit: number;
  keyword: string;
  sortOrder?: 'ASC' | 'DESC'
  sortBy?: string;
}

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
}
