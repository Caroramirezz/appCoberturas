using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;
using Coberturas.Contexts;
using Coberturas.Models.Platts;
using Microsoft.EntityFrameworkCore;

namespace Coberturas.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class PlattsController : ControllerBase
  {
    private readonly ConnectionSQL _context;

    public PlattsController(ConnectionSQL context)
    {
      _context = context;
    }

    // READ (Get Platts Records)
    [HttpGet]
    [Route("records")]
    public IActionResult GetPlattsRecords()
    {
      try
      {
        List<PlattsRecord> records = new List<PlattsRecord>();

        using (SqlConnection connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          SqlCommand command = new SqlCommand("sp_get_platts_records", connection)
          {
            CommandType = CommandType.StoredProcedure
          };

          connection.Open();
          using (SqlDataReader reader = command.ExecuteReader())
          {
            while (reader.Read())
            {
              PlattsRecord record = new PlattsRecord
              {
                id = reader.GetInt32(reader.GetOrdinal("id")),
                symbol = reader.GetString(reader.GetOrdinal("symbol")),
                bate = reader.GetString(reader.GetOrdinal("bate")),
                // Handle Decimal conversion to double
                value = reader.IsDBNull(reader.GetOrdinal("value")) ? 0.0 : (double)reader.GetDecimal(reader.GetOrdinal("value")),
                assess_date = reader.IsDBNull(reader.GetOrdinal("assess_date")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("assess_date")),
                mod_date = reader.IsDBNull(reader.GetOrdinal("mod_date")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("mod_date"))
              };
              records.Add(record);
            }
          }
        }

        return Ok(records);
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }



    // INSERT (Insert New Platts Records)
    [HttpPost("insert")]
    public IActionResult InsertPlattsRecords([FromBody] List<PlattsRecord> records)
    {
      if (records == null || records.Count == 0)
      {
        return BadRequest(new { error = "No records provided." });
      }

      try
      {
        using (SqlConnection connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();

          foreach (var record in records)
          {
            SqlCommand command = new SqlCommand("sp_ins_platts_records", connection)
            {
              CommandType = CommandType.StoredProcedure
            };

            command.Parameters.Add(new SqlParameter("@symbol", SqlDbType.VarChar) { Value = record.symbol });
            command.Parameters.Add(new SqlParameter("@value", SqlDbType.Float) { Value = record.value });
            command.Parameters.Add(new SqlParameter("@assess_date", SqlDbType.DateTime) { Value = record.assess_date ?? (object)DBNull.Value });
            command.Parameters.Add(new SqlParameter("@mod_date", SqlDbType.DateTime) { Value = record.mod_date ?? DateTime.Now });
            command.Parameters.Add(new SqlParameter("@bate", SqlDbType.VarChar) { Value = record.bate });

            command.ExecuteNonQuery();
          }
        }

        return Ok(new { message = "Records inserted successfully." });
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }





    // UPDATE (Update Platts Records)
    [HttpPut("update/{id}")]
    public IActionResult UpdatePlattsRecord(int id, [FromBody] PlattsRecord record)
    {
      if (record == null)
      {
        return BadRequest(new { error = "The record field is required." });
      }

      try
      {
        using (SqlConnection connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();

          SqlCommand command = new SqlCommand("sp_upd_platts_record", connection)
          {
            CommandType = CommandType.StoredProcedure
          };

          command.Parameters.Add(new SqlParameter("@id", SqlDbType.Int) { Value = id });
          command.Parameters.Add(new SqlParameter("@symbol", SqlDbType.VarChar) { Value = record.symbol });
          command.Parameters.Add(new SqlParameter("@value", SqlDbType.Float) { Value = record.value });
          command.Parameters.Add(new SqlParameter("@assess_date", SqlDbType.DateTime) { Value = record.assess_date ?? (object)DBNull.Value });
          command.Parameters.Add(new SqlParameter("@mod_date", SqlDbType.DateTime) { Value = record.mod_date ?? DateTime.Now });
          command.Parameters.Add(new SqlParameter("@bate", SqlDbType.VarChar) { Value = record.bate });

          command.ExecuteNonQuery();
        }

        return Ok(new { message = "Record updated successfully." });
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }



    [HttpGet("latest-date")]
    public IActionResult GetLatestAssessDate()
    {
      try
      {
        DateTime? latestDate;

        using (SqlConnection connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          SqlCommand command = new SqlCommand("SELECT MAX(assess_date) FROM platts_records", connection);
          connection.Open();
          latestDate = (DateTime?)command.ExecuteScalar();
        }

        if (latestDate.HasValue)
        {
          return Ok(new { assess_date = latestDate.Value.ToString("yyyy-MM-dd") });
        }
        else
        {
          return Ok(new { assess_date = "2020-01-01" }); // Default if no data exists
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }







  }
}
