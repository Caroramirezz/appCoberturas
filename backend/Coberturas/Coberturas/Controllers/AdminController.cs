using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;
using Coberturas.Models;
using Coberturas.Contexts;
using Coberturas.Models.Trades;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using Microsoft.EntityFrameworkCore;


namespace Coberturas.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class AdminController : ControllerBase
  {
    private readonly ConnectionSQL _context;

    public AdminController(ConnectionSQL context)
    {
      _context = context;
    }

    [HttpGet]
    [Route("banks/consulta")]
    public IActionResult getBanks()
    {
      try
      {
        List<Banks> banks = new List<Banks>();
        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand command = new SqlCommand("sp_get_banks", conexion)
        {
          CommandType = CommandType.StoredProcedure
        };

        conexion.Open();
        using (SqlDataReader reader = command.ExecuteReader())
        {
          while (reader.Read())
          {
            Banks bank = new Banks
            {
              id_bank = reader.GetInt32(reader.GetOrdinal("id_bank")),
              bank = reader.GetString(reader.GetOrdinal("bank")),
              CSA = reader.GetInt32(reader.GetOrdinal("CSA"))
            };
            banks.Add(bank);
          }
        }
        conexion.Close();
        return Ok(banks);
      }
      catch (Exception ex)
      {
        return BadRequest($"An error occurred: {ex.Message}");
      }
    }
  }
}
