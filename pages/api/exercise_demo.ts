import type {NextApiRequest, NextApiResponse} from "next";
import { jwtVerificationHandler} from "../../../internal/nextHandler/jwt_verification_handler";

type Data = {
    err?: string;
    description?: string;
    key?: string;
};

/**
 * An exercise to be familiar with Next.js
 * return Hello World!
 * @param req
 * @param res
 */
async function handler(req: NextApiRequest, res: NextApiResponse){
    const {user, key} = req.body;
    const returnData: Data = {};
    returnData.key = user;
    try {
        returnData.description = "Hello, World!";
        res.status(200).json(returnData);
    } catch (err) {
        // @ts-ignore
        returnData.err = err;
        res.status(500).json(returnData);
    }
};

export default jwtVerificationHandler(handler);
