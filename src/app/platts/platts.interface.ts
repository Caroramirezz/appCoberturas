export interface DataItem {
    bate: string;
    value: number;
    assessDate: string;
    symbol: string;
  }
  
  export interface Result {
    symbol: string;
    data: DataItem[];
  }
  
  export interface ApiResponse {
    metadata: {
      count: number;
      pageSize: number;
      page: number;
      totalPages: number;
      queryTime: string;
    };
    results: Result[];
  }
  