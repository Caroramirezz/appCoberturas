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
    }
}

