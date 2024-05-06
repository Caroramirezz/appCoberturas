using Coberturas.Models.Auth;

namespace Coberturas.Services
{
  public interface IAutorizacionService
  {
    Task<AutorizacionResponse> DevolverToken(AutorizacionRequest autorizacion);
  }
}
