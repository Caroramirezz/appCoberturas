namespace Coberturas.Models.Platts
{
  public class PlattsRecord
  {
    public int id { get; set; }
    public string symbol { get; set; }
    public double value { get; set; }
    public DateTime? assess_date { get; set; }  // Nullable DateTime
    public DateTime? mod_date { get; set; }     // Nullable DateTime
    public string bate { get; set; }
    public DateTime last_updated { get; set; }
  }

}
