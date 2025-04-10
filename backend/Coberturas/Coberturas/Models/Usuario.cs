using System.ComponentModel.DataAnnotations;

namespace Coberturas.Models
{
  public class Usuario
  {
    [Key]
    public int? id_usuario { get; set; }
    public string? nombre_usuario { get; set; }
    public string email_usuario { get; set; }
    public string password_usuario { get; set; }
    public int permiso_usuario { get; set; }

    // permissions
    public bool permiso_new_trade { get; set; }
    public bool permiso_upload_file { get; set; }
    public bool permiso_settled { get; set; }
    public bool permiso_edit_trade { get; set; }
    public bool permiso_action_column { get; set; }
    public bool permiso_catalogs { get; set; }
  }
}
