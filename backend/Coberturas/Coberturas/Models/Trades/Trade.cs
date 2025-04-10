using CsvHelper.Configuration.Attributes;


namespace Coberturas.Models.Trades
{
  public class Trade
  {
    public int? id_mov { get; set; } 
    public string id_trade { set; get; }
		public string? id_neg { set; get; }
		public Boolean settled { set; get; }
    public int id_trade_type { set; get; }
    public string? trade_type_name { set; get; } 
    public Boolean bank_leg { set; get; }
    public int? counterparty { set; get; }
    public DateTime trade_date { set; get; }
    public int id_sar { set; get; }
    public string? number_sar { set; get; }  
    public DateTime trade_month { set; get; }
    public int id_instrument { set; get; }
    public string? instrument { set; get; }  
    public int id_hedge_type { set; get; }
    public string? hedge_type { get; set; } 
    public int id_index { set; get; }
    public string? index_name { set; get; }
    public string? index_symbol_B { get; set; }

    public int id_volume_basis { set; get; }
    public string? volume_basis { set; get; } 
    public int id_operation { set; get; }
    public string? operation { set; get; }  
    public int id_currency { set; get; }
    public string? currency_name { set; get; }
    public decimal vol_daily { set; get; }
    public decimal vol_monthly { set; get; }
    public decimal price { set; get; }
    public int id_unit { set; get; }
    public string? volume_unit { set; get; }
    public int? id_bank { set; get; }
    public string? bank { set; get; }
    public int? id_plant { set; get; }
    public string? client { set; get; }
    public decimal? market_price { get; set; }
    public decimal bloomberg_curr {  get; set; }
    public decimal worstcase_curr { get; set; }
    public decimal mtm_usd { get; set; }
    public decimal worstcase_usd { get; set; }
    public decimal wc_price { get; set; }

  }

  public class TradeCsvDTO
  {
    public string id_neg { get; set; }
    public bool settled { get; set; }
    public int id_trade_type { get; set; }
    public bool bank_leg { get; set; }
    public int counterparty { get; set; }

    [TypeConverter(typeof(SafeTypeConverter<DateTime>))] // ✅ Auto-fixes invalid dates
    public DateTime trade_date { get; set; }

    public int id_sar { get; set; }

    [TypeConverter(typeof(SafeTypeConverter<DateTime>))] // ✅ Auto-fixes invalid dates
    public DateTime trade_month { get; set; }

    public int id_instrument { get; set; }
    public int id_hedge_type { get; set; }
    public int id_index { get; set; }
    public int id_volume_basis { get; set; }
    public int id_operation { get; set; }
    public int id_currency { get; set; }

    [TypeConverter(typeof(SafeTypeConverter<decimal>))] // ✅ Auto-fixes NaN & #N/A
    public decimal vol_daily { get; set; }

    [TypeConverter(typeof(SafeTypeConverter<decimal>))]
    public decimal vol_monthly { get; set; }

    [TypeConverter(typeof(SafeTypeConverter<decimal>))]
    public decimal price { get; set; }

    public int id_unit { get; set; }
    public int? id_bank { get; set; }
    public int? id_plant { get; set; }

    [TypeConverter(typeof(SafeTypeConverter<decimal>))]
    public decimal market_price { get; set; }

    [TypeConverter(typeof(SafeTypeConverter<decimal>))]
    public decimal bloomberg_curr { get; set; }

    [TypeConverter(typeof(SafeTypeConverter<decimal>))]
    public decimal worstcase_curr { get; set; }

    [TypeConverter(typeof(SafeTypeConverter<decimal>))]
    public decimal mtm_usd { get; set; }

    [TypeConverter(typeof(SafeTypeConverter<decimal>))]
    public decimal worstcase_usd { get; set; }

    [TypeConverter(typeof(SafeTypeConverter<decimal>))]
    public decimal wc_price { get; set; }
  }

}

