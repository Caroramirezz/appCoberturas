export interface BloombergRecord {
    id: number;
    dlSnapshotStartTime: Date;
    identifier: string;
    pxLast?: number;
    lastTradeableDt?: string;
  }