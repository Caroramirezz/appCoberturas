using Coberturas.Contexts;
using Coberturas.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
  private readonly ConnectionSQL _context;

  public UserController(ConnectionSQL context)
  {
    _context = context;
  }

  // GET: api/user/permissions
  [HttpGet("permissions")]
  public async Task<ActionResult<IEnumerable<Usuario>>> GetUserPermissions()
  {
    var users = await _context.usuarios
        .Select(u => new
        {
          id = u.id_usuario,
          name = u.nombre_usuario,
          email = u.email_usuario,
          permissions = new
          {
            newTrade = u.permiso_new_trade,
            uploadFile = u.permiso_upload_file,
            settled = u.permiso_settled,
            editTrade = u.permiso_edit_trade,
            actionColumn = u.permiso_action_column,
            catalogs = u.permiso_catalogs
          }
        })
        .ToListAsync();

    return Ok(users);
  }

  // Update permiso usuario

  [HttpPut("permissions/{id}")]
  public async Task<IActionResult> UpdateUserPermissions(int id, [FromBody] UserPermissionsDto dto)
  {
    var user = await _context.usuarios.FindAsync(id);
    if (user == null)
      return NotFound();

    user.permiso_new_trade = dto.permiso_new_trade;
    user.permiso_upload_file = dto.permiso_upload_file;
    user.permiso_settled = dto.permiso_settled;
    user.permiso_edit_trade = dto.permiso_edit_trade;
    user.permiso_action_column = dto.permiso_action_column;
    user.permiso_catalogs = dto.permiso_catalogs;

    await _context.SaveChangesAsync();
    return NoContent();
  }

}
