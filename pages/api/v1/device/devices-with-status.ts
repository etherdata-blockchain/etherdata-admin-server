import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { configs } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { jwtVerificationHandler } from "@etherdata-blockchain/next-js-handlers";

/**
 * Found devices with status from storage management system and etd status database
 * @param {NextApiRequest} req request
 * @param {NextApiResponse} res response
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user, page } = req.query;

  const storagePlugin = new dbServices.StorageManagementService();

  try {
    const pageNum = parseInt(
      (page ??
        configs.Configurations.defaultPaginationStartingPage.toString()) as string
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
