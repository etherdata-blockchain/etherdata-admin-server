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

export interface Web3DataInfo {
  timestamp: number | string;
  difficulty: string;
  gasLimit: number;
  gasUsed: number;
  hash: string;
  miner: string;
  nonce: string;
  blockNumber: number;
  balance: string;
  systemInfo: {
    name: string;
    nodeId?: string;
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
