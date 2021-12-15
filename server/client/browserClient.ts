import {
  DeviceRegistrationPlugin,
  VersionInfo,

} from "../../internal/services/dbServices/device-registration-plugin";
import { IDevice } from "../../internal/services/dbSchema/device";
import { StorageManagementSystemPlugin } from "../../internal/services/dbServices/storage-management-system-plugin";
import { Configurations } from "../../internal/const/configurations";

export interface ClientFilter {
  key: string;
  value: any;
}

export interface PaginationResult {
  devices: IDevice[];
  /**
   * Total number of devices in the storage
   */
  totalStorageNumber: number;
  /**
   * Total number of devices with filter
   */
  totalNumberDevices: number;
  /**
   * Total number of online devices with filter
   */
  totalOnlineDevices: number;
  adminVersions: VersionInfo[];
  nodeVersions: VersionInfo[];
  clientFilter?: ClientFilter;
}

/**
 * Browser client
 */
export class BrowserClient {
  numPerPage: number = Configurations.numberPerPage;
  currentPage: number = 0;
  lastResult?: PaginationResult;
  currentFilter?: ClientFilter;
  /**
   * Only get device info in this list
   */
  deviceIds: string[] = [];

  /**
   * Generate pagination results based on current page number
   */
  async generatePaginationResult(): Promise<PaginationResult> {
    const devicePlugin = new DeviceRegistrationPlugin();
    const storageSystem = new StorageManagementSystemPlugin();
    const onlineDevicesCount = await devicePlugin.getOnlineDevicesCount(
      this.deviceIds,
      this.currentFilter
    );

    if (!this.deviceIds || this.deviceIds.length === 0) {
      return {
        adminVersions: [],
        clientFilter: undefined,
        devices: [],
        nodeVersions: [],
        totalNumberDevices: 0,
        totalOnlineDevices: onlineDevicesCount,
        totalStorageNumber: await storageSystem.countItems(),
      };
    }

    const devices = await devicePlugin.listWithFilter(
      this.currentPage,
      this.numPerPage,
      this.deviceIds,
      this.currentFilter
    );

    const totalNumDevices = await devicePlugin.countWithFilter(
      this.deviceIds,
      this.currentFilter
    );
    const adminVersions = await devicePlugin.getListOfAdminVersions();
    const nodeVersions = await devicePlugin.getListOfNodeVersion();

    const paginationResult: PaginationResult = {
      totalStorageNumber: await storageSystem.countItems(),
      devices: devices?.results ?? [],
      totalNumberDevices: totalNumDevices,
      totalOnlineDevices: onlineDevicesCount,
      adminVersions,
      nodeVersions,
      clientFilter: this.currentFilter,
    };

    this.lastResult = paginationResult;
    return paginationResult;
  }
}
