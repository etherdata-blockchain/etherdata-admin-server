/**
 * Create a user object for mongoose ORM.
 *
 * This file contains the device schema for mongodb device collection
 */
import { Schema, model, connect, Document, Model } from "mongoose";
import { Web3DataInfo } from "../client/node_data";
import mongoose from "mongoose";

export interface IJobResult {
  jobId: string;
  time: Date;
  deviceID: string;
  /**
   * From which client. This will be the unique id
   */
  from: string;
  command: any;
  result: any;
  success: boolean;
}
