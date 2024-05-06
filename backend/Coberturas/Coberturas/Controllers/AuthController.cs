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
        public async Task<IActionResult> Autenticar([FromBody] AutorizacionRequest autorizacion){
            var resultado_autorizacion = await _autorizacionService.DevolverToken(autorizacion);
            if (resultado_autorizacion == null)
            {                
                return Unauthorized("Acceso Negado");
            }
            return Ok(resultado_autorizacion);
        }

    }
}
