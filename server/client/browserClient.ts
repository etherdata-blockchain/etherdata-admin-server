import {
  DeviceRegistrationPlugin,
  VersionInfo,
} from "../plugin/plugins/deviceRegistrationPlugin";
import { IDevice } from "../schema/device";
import { StorageManagementSystemPlugin } from "../plugin/plugins/storageManagementSystemPlugin";
import { Configurations } from "../const/configurations";

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
    let devicePlugin = new DeviceRegistrationPlugin();
    let storageSystem = new StorageManagementSystemPlugin();
    let onlineDevicesCount = await devicePlugin.getOnlineDevicesCount(
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

    let devices =
      (await devicePlugin.listWithFilter(
        this.currentPage,
        this.numPerPage,
        this.deviceIds,
        this.currentFilter
      )) ?? [];

    let totalNumDevices = await devicePlugin.countWithFilter(
      this.deviceIds,
      this.currentFilter
    );
    const adminVersions = await devicePlugin.getListOfAdminVersions();
    const nodeVersions = await devicePlugin.getListOfNodeVersion();

    let paginationResult: PaginationResult = {
      totalStorageNumber: await storageSystem.countItems(),
      devices: devices,
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
