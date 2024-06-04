namespace Coberturas.Models.Trades
{
  public class Plants
  {
    public int id_plant { get; set; }
    public string name_plant { get; set; }
    public DateTime inicio_contrato { get; set; }
    public DateTime fin_contrato { get; set; }
    public int client_id { get; set; }
  }
}
