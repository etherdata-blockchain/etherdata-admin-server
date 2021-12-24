import type { NextApiRequest, NextApiResponse } from "next";
import { DeviceRegistrationPlugin } from "../../../../internal/services/dbServices/device-registration-plugin";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { StorageManagementSystemPlugin } from "../../../../internal/services/dbServices/storage-management-system-plugin";
import {
  PaginationResult,
  StorageItem,
  StorageItemWithStatus,
} from "../../../../internal/const/common_interfaces";
import { StatusCodes } from "http-status-codes";
import { IDevice } from "../../../../internal/services/dbSchema/device";

/**
 * Merge status
 * @param storageItems
 * @param status
 */
function getStorageItemsWithStatus(
  storageItems: PaginationResult<StorageItem>,
  status: IDevice[]
) {
  const itemsWithStatus = storageItems.results.map((i) => {
    const foundStatus = status.find((s) => s.id === i.qr_code);
    const storageItemWithStatus: StorageItemWithStatus = {
      ...i,
      status: foundStatus,
    };
    return storageItemWithStatus;
  });
  storageItems.results = itemsWithStatus;
  return storageItems;
}

/**
 * Found devices with status from storage management system and etd status database
 * @param {NextApiRequest} req request
 * @param {NextApiResponse} res response
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user, page, online, adminVersion, nodeVersion } = req.query;

  const plugin = new DeviceRegistrationPlugin();
  const storagePlugin = new StorageManagementSystemPlugin();

  try {
    const storageItems = await storagePlugin.getDevicesByUser(
      page as string,
      user as string
    );
    const status = await plugin.getDeviceStatusByStorageItems(
      storageItems.results
    );
    const itemsWithStatus = getStorageItemsWithStatus(storageItems, status);

    res.status(StatusCodes.OK).json(itemsWithStatus);
  } catch (e) {
    // @ts-ignore
    if (e.response.status !== StatusCodes.BAD_REQUEST) {
      throw e;
    }
    //@ts-ignore
    const data: PaginationResult<any> = {
      totalPage: 0,
      currentPage: 0,
      results: [],
    };
    res.status(StatusCodes.OK).json(data);
  }
}

export default jwtVerificationHandler(handler);
