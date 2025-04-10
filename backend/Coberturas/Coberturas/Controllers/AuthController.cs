using Microsoft.AspNetCore.Mvc;
using Coberturas.Contexts;
using Coberturas.Models;
using Coberturas.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Coberturas.Models.Auth;

namespace Coberturas.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ConnectionSQL _context;
        private readonly IAutorizacionService _autorizacionService;

        public AuthController(ConnectionSQL context, IAutorizacionService autorizacionService)
        {
            _context = context;
            _autorizacionService = autorizacionService; 
        }


    [HttpPost]
    [Route("Autenticar")]
    public async Task<IActionResult> Autenticar([FromBody] AutorizacionRequest autorizacion)
    {
      var resultado_autorizacion = await _autorizacionService.DevolverToken(autorizacion);

      if (resultado_autorizacion == null)
      {
        return Unauthorized("Acceso Negado");
      }

      // ✅ Find the user by email
      var usuario = await _context.usuarios
          .Where(u => u.email_usuario == autorizacion.user)
          .Select(u => new {
            u.id_usuario,
            u.nombre_usuario,
            u.permiso_usuario,
            u.permiso_new_trade,
            u.permiso_upload_file,
            u.permiso_settled,
            u.permiso_edit_trade,
            u.permiso_action_column,
            u.permiso_catalogs
          })

          .FirstOrDefaultAsync();

      if (usuario == null)
      {
        return Unauthorized("Usuario no encontrado");
      }

      // ✅ Keep original token structure
      return Ok(new
      {
        token = resultado_autorizacion,
        data = new
        {
          usuario.id_usuario,
          usuario.nombre_usuario,
          usuario.permiso_usuario,
          permiso_new_trade = usuario.permiso_new_trade,
          permiso_upload_file = usuario.permiso_upload_file,
          permiso_settled = usuario.permiso_settled,
          permiso_edit_trade = usuario.permiso_edit_trade,
          permiso_action_column = usuario.permiso_action_column,
          permiso_catalogs = usuario.permiso_catalogs
        }
      });


    }



  }
}
