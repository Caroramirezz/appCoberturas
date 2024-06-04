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

    [HttpPost]
    [Route("banks/add")]
    public IActionResult AddBank([FromBody] Banks bank)
    {
      try
      {
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("sp_ins_banks", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@bank", SqlDbType.VarChar) { Value = bank.bank });
          command.Parameters.Add(new SqlParameter("@CSA", SqlDbType.Int) { Value = bank.CSA });

          command.ExecuteNonQuery();

          command = new SqlCommand("SELECT TOP 1 * FROM banks ORDER BY id_bank DESC", connection);
          var reader = command.ExecuteReader();
          if (reader.Read())
          {
            var newBank = new Banks
            {
              id_bank = (int)reader["id_bank"],
              bank = (string)reader["bank"],
              CSA = (int)reader["CSA"]
            };
            return Ok(newBank);
          }
          else
          {
            throw new Exception("Failed to retrieve new bank data.");
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }

    [HttpGet]
    [Route("index/consulta")]
    public IActionResult getIndexes()
    {
      try
      {
        List<IndexTypes> indexTypes = new List<IndexTypes>();
        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand command = new SqlCommand("sp_get_index_types", conexion)
        {
          CommandType = CommandType.StoredProcedure
        };

        conexion.Open();
        using (SqlDataReader reader = command.ExecuteReader())
        {
          while (reader.Read())
          {
            IndexTypes indextypes = new IndexTypes
            {
              id_index = reader.GetInt32(reader.GetOrdinal("id_index")),
              index_name = reader.GetString(reader.GetOrdinal("index_name")),
              index_symbol = reader.GetString(reader.GetOrdinal("index_symbol")),
              source = reader.GetString(reader.GetOrdinal("source")),
            };
            indexTypes.Add(indextypes);
          }
        }
        conexion.Close();
        return Ok(indexTypes);
      }
      catch (Exception ex)
      {
        return BadRequest($"An error occurred: {ex.Message}");
      }
    }

    [HttpDelete("index/{id}")]
    public IActionResult DeleteIndex(int id)
    {
      try
      {
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          using (var command = new SqlCommand("sp_del_index_type", connection))
          {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@id_index", SqlDbType.Int) { Value = id });

            command.ExecuteNonQuery();
          }
          connection.Close();
          return Ok(new { message = "Index successfully deleted." });
        }
      }
      catch (Exception ex)
      {
        return BadRequest($"Error deleting index: {ex.Message}");
      }
    }

    [HttpPost]
    [Route("index/add")]
    public IActionResult AddIndex([FromBody] IndexTypes indextypes)
    {
      try
      {
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("sp_ins_index_type", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@index_name", SqlDbType.VarChar) { Value = indextypes.index_name });
          command.Parameters.Add(new SqlParameter("@index_symbol", SqlDbType.VarChar) { Value = indextypes.index_symbol });
          command.Parameters.Add(new SqlParameter("@source", SqlDbType.VarChar) { Value = indextypes.source });


          command.ExecuteNonQuery();

          command = new SqlCommand("SELECT TOP 1 * FROM IndexTypes ORDER BY id_index DESC", connection);
          var reader = command.ExecuteReader();
          if (reader.Read())
          {
            var newIndex = new IndexTypes
            {
              id_index = (int)reader["id_index"],
              index_name = (string)reader["index_name"],
              index_symbol = (string)reader["index_symbol"],
              source = (string)reader["source"]
            };
            return Ok(newIndex);
          }
          else
          {
            throw new Exception("Failed to retrieve new index data.");
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
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
          using (var command = new SqlCommand("sp_del_sars", connection))
          {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@id_sar", SqlDbType.Int) { Value = id });

            command.ExecuteNonQuery();  
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

    [HttpPut("banks/update/{id}")]
    public IActionResult UpdateClient(int id, [FromBody] Banks bank)
    {
      try
      {
        if (id != bank.id_bank)
        {
          return BadRequest("Bank ID mismatch");
        }

        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("sp_upd_banks", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@id_bank", bank.id_bank));
          command.Parameters.Add(new SqlParameter("@bank", bank.bank));
          command.Parameters.Add(new SqlParameter("@CSA", bank.CSA));

          int result = command.ExecuteNonQuery();
          if (result > 0)
          {
            return Ok(new { message = "Bank updated successfully." });
          }
          else
          {
            return NotFound("Bank not found.");
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest($"An error occurred: {ex.Message}");
      }
    }


    [HttpPost]
    [Route("sars/add")]
    public IActionResult AddSar([FromBody] SAR sar)
    {
      try
      {
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("sp_ins_sars", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@number_sar", SqlDbType.VarChar) { Value = sar.number_sar });

          command.ExecuteNonQuery();

          command = new SqlCommand("SELECT TOP 1 * FROM sars_number ORDER BY id_sar DESC", connection);
          var reader = command.ExecuteReader();
          if (reader.Read())
          {
            var newSar = new SAR
            {
              id_sar = (int)reader["id_sar"],
              number_sar = (string)reader["number_sar"],
            };
            return Ok(newSar);
          }
          else
          {
            throw new Exception("Failed to retrieve new SAR data.");
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }



    [HttpGet]
    [Route("clients/consulta")]
    public IActionResult getClients()
    {
      try
      {
        List<Clients> clients = new List<Clients>();
        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand command = new SqlCommand("sp_get_clients", conexion)
        {
          CommandType = CommandType.StoredProcedure
        };

        conexion.Open();
        using (SqlDataReader reader = command.ExecuteReader())
        {
          while (reader.Read())
          {
            Clients client = new Clients
            {
              id_client = reader.GetInt32(reader.GetOrdinal("id_client")),
              client = reader.GetString(reader.GetOrdinal("client")),
              holding = reader.GetString(reader.GetOrdinal("holding"))
            };
            clients.Add(client);
          }
        }
        conexion.Close();
        return Ok(clients);
      }
      catch (Exception ex)
      {
        return BadRequest($"An error occurred: {ex.Message}");
      }
    }


    [HttpGet]
    [Route("plants/consulta")]
    public IActionResult getPlants(int? clientId)
    {
      try
      {
        List<Plants> plants = new List<Plants>();
        using (var conexion = (SqlConnection)_context.Database.GetDbConnection())
        {
          var query = "SELECT * FROM plants WHERE @clientId IS NULL OR client_id = @clientId";
          var command = new SqlCommand(query, conexion)
          {
            CommandType = CommandType.Text
          };
          command.Parameters.Add(new SqlParameter("@clientId", clientId ?? (object)DBNull.Value));

          conexion.Open();
          using (var reader = command.ExecuteReader())
          {
            while (reader.Read())
            {
              Plants plant = new Plants
              {
                id_plant = reader.GetInt32(reader.GetOrdinal("id_plant")),
                name_plant = reader.GetString(reader.GetOrdinal("name_plant")),
                inicio_contrato = reader.GetDateTime(reader.GetOrdinal("inicio_contrato")),
                fin_contrato = reader.GetDateTime(reader.GetOrdinal("fin_contrato")),
                client_id = reader.GetInt32(reader.GetOrdinal("client_id")) // Make sure to add client_id to the Plants model if it's not already there
              };
              plants.Add(plant);
            }
          }
        }
        return Ok(plants);
      }
      catch (Exception ex)
      {
        return BadRequest($"An error occurred: {ex.Message}");
      }
    }

    [HttpPut("plants/update/{id}")]
    public IActionResult UpdatePlant(int id, [FromBody] Plants plant)
    {
      try
      {
        if (id != plant.id_plant)
        {
          return BadRequest("Plant ID mismatch");
        }

        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("sp_upd_plant", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@id_plant", id));
          command.Parameters.Add(new SqlParameter("@name_plant", plant.name_plant));
          command.Parameters.Add(new SqlParameter("@inicio_contrato", plant.inicio_contrato));
          command.Parameters.Add(new SqlParameter("@fin_contrato", plant.fin_contrato));
          command.Parameters.Add(new SqlParameter("@client_id", plant.client_id));

          int result = command.ExecuteNonQuery();
          if (result > 0)
          {
            return Ok(new { message = "Plant updated successfully." });
          }
          else
          {
            return NotFound("Plant not found.");
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest($"An error occurred: {ex.Message}");
      }
    }

    [HttpPut("clients/update/{id}")]
    public IActionResult UpdateClient(int id, [FromBody] Clients client)
    {
      try
      {
        if (id != client.id_client)
        {
          return BadRequest("Client ID mismatch");
        }

        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("sp_upd_clients", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@id_client", client.id_client));
          command.Parameters.Add(new SqlParameter("@client", client.client));
          command.Parameters.Add(new SqlParameter("@holding", client.holding));

          int result = command.ExecuteNonQuery();
          if (result > 0)
          {
            return Ok(new { message = "Client updated successfully." });
          }
          else
          {
            return NotFound("Client not found.");
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest($"An error occurred: {ex.Message}");
      }
    }

    [HttpDelete("clients/{id}")]
    public IActionResult DeleteClient(int id)
    {
      try
      {
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          using (var command = new SqlCommand("sp_del_clients", connection))
          {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@id_client", SqlDbType.Int) { Value = id });

            command.ExecuteNonQuery(); 
          }
          connection.Close();
          return Ok(new { message = "Client successfully deleted." });
        }
      }
      catch (Exception ex)
      {
        return BadRequest($"Error deleting client: {ex.Message}");
      }
    }

    [HttpDelete("plants/{id}")]
    public IActionResult DeletePlant(int id)
    {
      try
      {
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          using (var command = new SqlCommand("sp_del_plants", connection))
          {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@id_plant", SqlDbType.Int) { Value = id });

            command.ExecuteNonQuery();  
          }
          connection.Close();
          return Ok(new { message = "Plant successfully deleted." });
        }
      }
      catch (Exception ex)
      {
        return BadRequest($"Error deleting plant: {ex.Message}");
      }
    }

  }
}
