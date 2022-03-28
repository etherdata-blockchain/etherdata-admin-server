import { Environments } from "@etherdata-blockchain/common/dist/configs";

interface Param {
  nodeId: string;
  nodeName: string;
  host: string;
}

export const getReplacementMap = (param: Param) => ({
  etd_node_id: param.nodeId,
  etd_admin_password: Environments.ServerSideEnvironments.PUBLIC_SECRET,
  etd_admin_url: param.host,
  etd_node_name: param.nodeName,
});
