import { GridColDef } from "@mui/x-data-grid";

export const schemas: any = {
  title: "Docker Image",
  required: ["imageName", "tags"],
  properties: {
    imageName: { title: "Image Name", type: "string" },
    tags: {
      title: "Image tags",
      type: "array",
      items: { title: "Tag", type: "string" },
    },
  },
};

export const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    flex: 1,
  },
  {
    field: "imageName",
    headerName: "Image",
    flex: 4,
  },
  {
    field: "tags",
    headerName: "Tags",
    flex: 4,
  },
  {
    field: "selectedTag",
    headerName: "Selected Tag",
    flex: 4,
  },
  {
    field: "selected",
    headerName: "Selected",
    flex: 2,
    type: "boolean",
  },
];
