// jest.setup.ts
import "@testing-library/jest-dom";
import mongoose from "mongoose";

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
