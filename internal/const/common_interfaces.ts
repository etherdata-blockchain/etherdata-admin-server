import { IDevice } from "../services/dbSchema/device/device";

export interface PaginationResult<T> {
  results: T[];
  count: number;
  totalPage: number;
  currentPage: number;
  pageSize: number;
}

export interface StorageUser {
  // eslint-disable-next-line camelcase
  user_name: string;
  // eslint-disable-next-line camelcase
  user_id: string;
  coinbase?: string;
}

export interface StorageItem {
  name: string;
  description: string;
  price: number;
  column: number;
  row: number;
  // eslint-disable-next-line camelcase
  qr_code: string;
  // eslint-disable-next-line camelcase
  created_time: Date;
  // eslint-disable-next-line camelcase
  owner_name?: OwnerName;
  // eslint-disable-next-line camelcase
  machine_type_name: null;
  // eslint-disable-next-line camelcase
  location_name: null;
  // eslint-disable-next-line camelcase
  position_name: null;
  // eslint-disable-next-line camelcase
  owner_id: string;
  images: any[];
  uuid: string;
  // eslint-disable-next-line camelcase
  images_objects: any[];
}

export interface OwnerName {
  // eslint-disable-next-line camelcase
  user_id: string;
  // eslint-disable-next-line camelcase
  user_name: string;
  coinbase: string;
}

export interface StorageItemWithStatus extends StorageItem {
  status?: IDevice;
}

export interface RealtimeStatus {
  pendingJobNumber: number;
  onlineCount: number;
  totalCount: number;
}
