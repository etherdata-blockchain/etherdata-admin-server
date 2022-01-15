/**
 * List of socket io events
 */
export enum SocketIOEvents {
  detailInfo = "detail-info",
  latestInfo = "latest-info",
  //docker
  dockerError = "docker-error",
  dockerResult = "docker-result",
  dockerCommand = "docker-command",
  //rpc
  rpcCommand = "rpc-command",
  rpcResult = "rpc-result",
  rpcError = "rpc-error",
  //pending job
  pendingJob = "pending-job",
  joinRoom = "join-room",
  leaveRoom = "leave-room",
}
