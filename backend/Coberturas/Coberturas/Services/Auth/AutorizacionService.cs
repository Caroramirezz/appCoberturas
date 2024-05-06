using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Coberturas.Models;
using Coberturas.Models.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;
using Coberturas.Contexts;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Authorization;

namespace Coberturas.Services
{
  public class AutorizacionService : IAutorizacionService
  {

    private readonly ConnectionSQL _context;
    private readonly IConfiguration _configuration;

    public AutorizacionService(ConnectionSQL context, IConfiguration configuration)
    {
      _context = context;
      _configuration = configuration;
    }

    //Crear metodo para generar token
    private string generarToken(string id_usuario, string id_tipo_usuario)
    {
      var key = _configuration.GetValue<string>("JWT:Key");
      var keyBytes = Encoding.ASCII.GetBytes(key);

      var claims = new ClaimsIdentity();
      claims.AddClaim(new Claim(ClaimTypes.NameIdentifier, id_usuario));
      claims.AddClaim(new Claim(ClaimTypes.Role, id_tipo_usuario));

      var credencialesToken = new SigningCredentials(
          new SymmetricSecurityKey(keyBytes),
          SecurityAlgorithms.HmacSha256Signature
      );

      var tokenDescription = new SecurityTokenDescriptor
      {
        Subject = claims,
        Expires = DateTime.UtcNow.AddMinutes(30), //aqui cambiar el tiempo
        SigningCredentials = credencialesToken
      };

      var tokenHandler = new JwtSecurityTokenHandler();
      var tokenConfig = tokenHandler.CreateToken(tokenDescription);

      string tokenCreado = tokenHandler.WriteToken(tokenConfig);

      return tokenCreado;
    }

    public async Task<AutorizacionResponse> DevolverToken(AutorizacionRequest autorizacion)
    {
      //Validar que existe el usuario en la BD
      var usuario_encontrado = _context.usuarios.FirstOrDefault(x =>
          x.email_usuario == autorizacion.user &&
          x.password_usuario == autorizacion.password
      );
      //Si no existe el usuario.
      if (usuario_encontrado == null)
      {
        var result = new AutorizacionResponse() { token = "", resultado = false, msg = "Usuario no encontrado." };
        return await Task.FromResult(result);
      }
      //No regresar la contraseña
      usuario_encontrado.password_usuario = "";
      //Crear Token
      string tokenCreado = generarToken(usuario_encontrado.id_usuario.ToString(), usuario_encontrado.permiso_usuario.ToString());

      return new AutorizacionResponse() { token = tokenCreado, resultado = true, msg = "Token Generado. Acceso permitido.", data = usuario_encontrado };
    }
  }
}
