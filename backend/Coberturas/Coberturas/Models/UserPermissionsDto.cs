namespace Coberturas.Models
{
  public class UserPermissionsDto
  {
    public bool permiso_new_trade { get; set; }
    public bool permiso_upload_file { get; set; }
    public bool permiso_settled { get; set; }
    public bool permiso_edit_trade { get; set; }
    public bool permiso_action_column { get; set; }
    public bool permiso_catalogs { get; set; }
  }

}
