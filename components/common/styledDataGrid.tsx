// @flow
import * as React from "react";
import { styled } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";

type Props = {};

export const StyledDataGrid = styled(DataGrid)(({ theme }) => ({ border: 0 }));
