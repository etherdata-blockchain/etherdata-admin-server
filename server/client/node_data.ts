import { BlockTransactionString } from "web3-eth";

interface PeerInfo {
  caps: string[];
  id: string;
  name: string;
  network: {
    localAddress: string;
    remoteAddress: string;
  };
  protocols: any;
}

export interface Web3DataInfo extends BlockTransactionString {
  systemInfo: {
    adminVersion: string;
    nodeVersion: string;
    peerCount: number;
    isSyncing: boolean;
    isMining: boolean;
    coinbase: string | undefined;
    hashRate: number;
  };
  blockTime: number;
  avgBlockTime: number;
  peers: PeerInfo[];
}

/// This is for pending transaction
/// This will not include block number
/// since it is not available
export interface TransactionSummary {
  time: Date;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gas: number;
}
