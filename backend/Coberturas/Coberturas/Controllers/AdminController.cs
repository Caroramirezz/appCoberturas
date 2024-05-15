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

    [HttpDelete("banks/{id}")]
    public IActionResult DeleteBank(int id)
    {
      try
      {
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          using (var command = new SqlCommand("sp_del_banks", connection))
          {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@id_bank", SqlDbType.Int) { Value = id });

            command.ExecuteNonQuery();  // Execute the command
          }
          connection.Close();
          return Ok(new { message = "Bank successfully deleted." });
        }
      }
      catch (Exception ex)
      {
        return BadRequest($"Error deleting bank: {ex.Message}");
      }
    }


    [HttpPost("banks/add")]
    public IActionResult AddBank([FromBody] Banks bank)
    {
      if (bank == null || string.IsNullOrEmpty(bank.bank) || bank.CSA <= 0)
      {
        return BadRequest("Invalid bank data.");
      }

      try
      {
        using (var connection = new SqlConnection(_context.Database.GetConnectionString()))
        {
          using (var command = new SqlCommand("sp_ins_banks", connection))
          {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@bank", bank.bank));
            command.Parameters.Add(new SqlParameter("@CSA", bank.CSA));

            connection.Open();
            command.ExecuteNonQuery(); // Execute the insertion
            connection.Close();
          }
        }
        return Ok(new { message = "Bank added successfully." });
      }
      catch (Exception ex)
      {
        return BadRequest($"An error occurred: {ex.Message}");
      }
    }



    [HttpGet]
    [Route("sars/consulta")]
    public IActionResult getSars()
    {
      try
      {
        List<SAR> sars = new List<SAR>();
        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand command = new SqlCommand("sp_get_sars", conexion)
        {
          CommandType = CommandType.StoredProcedure
        };

        conexion.Open();
        using (SqlDataReader reader = command.ExecuteReader())
        {
          while (reader.Read())
          {
            SAR sar = new SAR
            {
              id_sar = reader.GetInt32(reader.GetOrdinal("id_sar")),
              number_sar = reader.GetString(reader.GetOrdinal("number_sar")),
            };
            sars.Add(sar);
          }
        }
        conexion.Close();
        return Ok(sars);
      }
      catch (Exception ex)
      {
        return BadRequest($"An error occurred: {ex.Message}");
      }
    }

    [HttpDelete("sars/{id}")]
    public IActionResult DeleteSars(int id)
    {
      try
      {
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          using (var command = new SqlCommand("sp_del_banks", connection))
          {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@id_sar", SqlDbType.Int) { Value = id });

            command.ExecuteNonQuery();  // Execute the command
          }
          connection.Close();
          return Ok(new { message = "Bank successfully deleted." });
        }
      }
      catch (Exception ex)
      {
        return BadRequest($"Error deleting bank: {ex.Message}");
      }
    }

  }
}
