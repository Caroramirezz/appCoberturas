namespace Coberturas.Models.Trades
{
  public class Plants
  {
    public int id_plant { get; set; }
    public string name_plant { get; set; }
    public DateTime inicio_contrato { get; set; }
    public DateTime fin_contrato { get; set; }

    //Estas se usan para FiltrosTrade/GetPlants
    public string? holding { get; set; }
    public string? client { get; set;}
    public double cmd { get; set; }
    public string unidad { get; set; }

    public int id_client { get; set; }
  }
}
