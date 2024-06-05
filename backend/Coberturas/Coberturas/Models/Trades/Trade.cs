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
    public decimal? effective_price { get; set; }
  }
}
