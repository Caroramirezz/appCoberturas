export interface TradeInterface {    
    //first step
    position:number;
    trade_date:string;
    id_trade_type:number;
    id_bank:number;    
    id_trade:string;
    id_sar:number;
    period_start:string;
    period_end:string;
    id_instrument:number;
    id_hedge_type:number;
    id_index:number
    id_volume_basis:number;
    id_unit:number;
    id_currency:number;
    id_operation:number;
    list_trades_period?:ListTrade[];
    suma_total_daily:number;
    suma_total_monthly:number;
    plants:any[];

    //second step 
    no_plants:number;    
    list_trades_plants:ListPlants[];
    
}

export interface ListTrade {
    position:number;
    date:Date;
    vol_daily:number;
    vol_monthly:number;
    price:number;
    month:number;
    days:number;
}

export interface ListPlants {    
    id_neg:number;
    id_plant:number;
    name_plant:string;
    id_trade:string;
    fill_down:boolean;    
    fill_down_price:boolean;    
    table:ListTrade[];
}


export interface SaveTrade {

    id_mov?:number;
    id_trade:string;
    id_neg?:string;
    settled:boolean;
    id_trade_type:number;
    bank_leg:boolean;
    counterparty:number;
    id_bank?:number;
    id_client?:number;
    id_plant?:number;
    trade_date:Date;
    id_sar:number;
    trade_month:Date;
    id_instrument:number;
    id_hedge_type:number;
    id_index:number;
    id_volume_basis:number;
    id_operation:number;
    id_currency:number;
    vol_daily:number;
    vol_monthly:number;
    price:number;
    id_unit:number;
}