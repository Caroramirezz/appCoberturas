export interface DataItem {
  num?: number;
  bate: string;
  value: number;
  assessDate: string;
  symbol: string;
  index: string;
}


export interface PlattsHistory {
  id_platts_hisotry?: string;  
  indexName: string;
  symbol: string;
  bate: string;
  value: number;
  assessDate: Date;  
  lastUpdated: Date;  
}

export interface PlattsRecordInsert {
  symbol: string;
  value: number;
  assess_date: string;
  mod_date: string | null;
  bate: string;
}

