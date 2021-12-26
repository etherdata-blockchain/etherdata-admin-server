import type { NextApiRequest, NextApiResponse } from "next";
import { jwtVerificationHandler } from "../../../../internal/nextHandler/jwt_verification_handler";
import { StorageManagementItemPlugin } from "../../../../internal/services/dbServices/storage-management-item-plugin";
import { PaginationResult } from "../../../../internal/const/common_interfaces";
import { StatusCodes } from "http-status-codes";
import { Configurations } from "../../../../internal/const/configurations";

/**
 * Found devices with status from storage management system and etd status database
 * @param {NextApiRequest} req request
 * @param {NextApiResponse} res response
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user, page, online, adminVersion, nodeVersion } = req.query;

  const storagePlugin = new StorageManagementItemPlugin();

  try {
    const pageNum = parseInt(
      (page ??
        Configurations.defaultPaginationStartingPage.toString()) as string
    );
    const storageItems = await storagePlugin.getDevicesByUser(
      pageNum,
      user as string
    );

    if (storageItems === undefined) {
      res.status(StatusCodes.NOT_FOUND).json({});
      return;
    }

    res.status(StatusCodes.OK).json(storageItems);
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
