namespace Coberturas.Models.Trades
{
  public class TradeUpdateModel
  {
    public int IdMov { get; set; }
    public decimal? MarketPrice { get; set; }
    public decimal? BloombergCurr { get; set; }
    public decimal? WorstcaseCurr { get; set; }
    public decimal? MtmUsd { get; set; }
    public decimal? WorstcaseUsd { get; set; }
    public decimal? wc_price { get; set; }
  }

}
