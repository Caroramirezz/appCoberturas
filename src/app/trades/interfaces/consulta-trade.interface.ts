export interface ConsultaTrade {

    id_mov?:number;
    id_trade:string;
    id_neg?:string;
    settled:boolean;
    id_trade_type:number;
    trade_type_name:string;
    bank_leg:boolean;
    counterparty:number;
    trade_date:Date;
    id_sar:number;
    number_sar:string;
    trade_month:Date;
    id_instrument:number;
    instrument:string;
    id_hedge_type:number;
    hedge_type:string;
    id_index:number;
    index_name:string;
    id_volume_basis:number;
    volume_basis:string;
    id_operation:number;
    operation:string;
    id_currency:number;
    currency_name:string;
    vol_daily:number;
    vol_monthly:number;
    price:number;
    id_unit:number;
    volume_unit:string;
    id_bank?:number;
    bank?:string;
    client?:string;
    id_client?:number;
    effective_price: number;

    //Falta Agrear el MTM 



}