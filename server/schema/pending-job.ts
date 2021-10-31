/**
 * Create a user object for mongoose ORM.
 *
 * This file contains the device schema for mongodb device collection
 */
import { Schema, model, connect, Document, Mixed, Model } from "mongoose";
import { Web3DataInfo } from "../client/node_data";
import mongoose from "mongoose";

interface Task {
  type: string;
  value: any;
}

export interface IPendingJob {
  targetDeviceId: string;
  /**
   * From client id.
   */
  from: string;
  time: Date;
  task: Task;
}
