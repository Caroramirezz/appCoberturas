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
using Coberturas.Models.Platts;


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

    // ************************************************ BANKS *****************************************************************

    // READ
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
              CSA = reader.GetInt32(reader.GetOrdinal("CSA")),
              threshold = reader.GetDouble(reader.GetOrdinal("threshold"))
            };
            banks.Add(bank);
          }
        }
        conexion.Close();
        return Ok(banks);
      }
      catch (Exception ex)
      {
        Console.WriteLine("Error details: " + ex.ToString());
        return BadRequest($"An error occurred: {ex.Message}");
      }
    }

    // DELETE
    [HttpDelete("banks/{id}")]
    public IActionResult DeleteBanks(int id)
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

    // CREATE
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
          command.Parameters.Add(new SqlParameter("@threshold", SqlDbType.Float) { Value = bank.threshold });

          command.ExecuteNonQuery();

          command = new SqlCommand("SELECT TOP 1 * FROM banks ORDER BY id_bank DESC", connection);
          var reader = command.ExecuteReader();
          if (reader.Read())
          {
            var newBank = new Banks
            {
              id_bank = (int)reader["id_bank"],
              bank = (string)reader["bank"],
              CSA = (int)reader["CSA"],
              threshold = (double)reader["threshold"]
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

    // UPDATE
    [HttpPut("banks/update/{id}")]
    public IActionResult UpdateBank(int id, [FromBody] Banks bank)
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
          command.Parameters.Add(new SqlParameter("@threshold", bank.threshold));

          var returnValue = new SqlParameter("@ReturnVal", SqlDbType.Int)
          {
            Direction = ParameterDirection.ReturnValue
          };
          command.Parameters.Add(returnValue);

          command.ExecuteNonQuery();

          int result = (int)returnValue.Value;
          if (result == -1)
          {
            return NotFound(new { message = "Bank not found." });
          }
          else
          {
            return Ok(new { message = "Bank updated successfully." });
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }


    // ********************************************* INDEX ******************************************************

    // READ
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
              index_symbol_P = reader.GetString(reader.GetOrdinal("index_symbol_P")),
              index_symbol_B = reader.GetString(reader.GetOrdinal("index_symbol_B")),
              index_symbol_Neg = reader.GetString(reader.GetOrdinal("index_symbol_Neg")),
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

    // DELETE
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

    // CREATE
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
          command.Parameters.Add(new SqlParameter("@index_symbol_P", SqlDbType.VarChar) { Value = indextypes.index_symbol_P });
          command.Parameters.Add(new SqlParameter("@index_symbol_B", SqlDbType.VarChar) { Value = indextypes.index_symbol_B });
          command.Parameters.Add(new SqlParameter("@index_symbol_Neg", SqlDbType.VarChar) { Value = indextypes.index_symbol_Neg });

          command.ExecuteNonQuery();

          command = new SqlCommand("SELECT TOP 1 * FROM index_types ORDER BY id_index DESC", connection);
          var reader = command.ExecuteReader();
          if (reader.Read())
          {
            var newIndex = new IndexTypes
            {
              id_index = (int)reader["id_index"],
              index_name = (string)reader["index_name"],
              index_symbol_P = (string)reader["index_symbol_P"],
              index_symbol_B = (string)reader["index_symbol_B"],
              index_symbol_Neg = (string)reader["index_symbol_Neg"]
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

    // UPDATE
    [HttpPut("index/update/{id}")]
    public IActionResult UpdateIndex(int id, [FromBody] IndexTypes indextypes)
    {
      try
      {
        if (id != indextypes.id_index)
        {
          return BadRequest("Index ID mismatch");
        }

        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("sp_upd_index_type", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@id_index", indextypes.id_index));
          command.Parameters.Add(new SqlParameter("@index_name", indextypes.index_name));
          command.Parameters.Add(new SqlParameter("@index_symbol_P", indextypes.index_symbol_P));
          command.Parameters.Add(new SqlParameter("@index_symbol_B", indextypes.index_symbol_B));
          command.Parameters.Add(new SqlParameter("@index_symbol_Neg", indextypes.index_symbol_Neg));

          var returnValue = new SqlParameter("@ReturnVal", SqlDbType.Int)
          {
            Direction = ParameterDirection.ReturnValue
          };
          command.Parameters.Add(returnValue);

          command.ExecuteNonQuery();

          int result = (int)returnValue.Value;
          if (result == -1)
          {
            return NotFound(new { message = "Index not found." });
          }
          else
          {
            return Ok(new { message = "Index updated successfully." });
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }

    // ************************************************ SARS *************************************************************************

    // READ
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
              description = reader.IsDBNull(reader.GetOrdinal("description")) ? null : reader.GetString(reader.GetOrdinal("description")),
              fecha_inicio = reader.GetDateTime(reader.GetOrdinal("fecha_inicio")),
              fecha_fin = reader.GetDateTime(reader.GetOrdinal("fecha_fin"))
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

    // DELETE
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
          return Ok(new { message = "SAR successfully deleted." });
        }
      }
      catch (Exception ex)
      {
        return BadRequest($"Error deleting SAR: {ex.Message}");
      }
    }

    // CREATE
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
          command.Parameters.Add(new SqlParameter("@description", SqlDbType.VarChar) { Value = sar.description });
          command.Parameters.Add(new SqlParameter("@fecha_inicio", SqlDbType.Date) { Value = sar.fecha_inicio });
          command.Parameters.Add(new SqlParameter("@fecha_fin", SqlDbType.Date) { Value = sar.fecha_fin });

          command.ExecuteNonQuery();

          command = new SqlCommand("SELECT TOP 1 * FROM sars_number ORDER BY id_sar DESC", connection);
          var reader = command.ExecuteReader();
          if (reader.Read())
          {
            var newSar = new SAR
            {
              id_sar = (int)reader["id_sar"],
              number_sar = (string)reader["number_sar"],
              description = (string)reader["description"],
              fecha_inicio = (DateTime)reader["fecha_inicio"],
              fecha_fin = (DateTime)reader["fecha_fin"]
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

    // UPDATE
    [HttpPut("sars/update/{id}")]
    public IActionResult UpdateSar(int id, [FromBody] SAR sar)
    {
      try
      {
        if (id != sar.id_sar)
        {
          return BadRequest("SAR ID mismatch");
        }

        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("sp_upd_sars", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@id_sar", sar.id_sar));
          command.Parameters.Add(new SqlParameter("@number_sar", sar.number_sar));
          command.Parameters.Add(new SqlParameter("@description", sar.description));
          command.Parameters.Add(new SqlParameter("@fecha_inicio", sar.fecha_inicio));
          command.Parameters.Add(new SqlParameter("@fecha_fin", sar.fecha_fin));

          var returnValue = new SqlParameter("@ReturnVal", SqlDbType.Int)
          {
            Direction = ParameterDirection.ReturnValue
          };
          command.Parameters.Add(returnValue);

          command.ExecuteNonQuery();

          int result = (int)returnValue.Value;
          if (result == -1)
          {
            return NotFound(new { message = "SAR not found." });
          }
          else
          {
            return Ok(new { message = "SAR updated successfully." });
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }



    // ******************************************* CLIENTS ************************************************

    // CREATE
    [HttpPost]
    [Route("clients/add")]
    public IActionResult AddClient([FromBody] Clients client)
    {
      try
      {
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("sp_ins_clients", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@client", client.client));
          command.Parameters.Add(new SqlParameter("@holding", client.holding));

          // Execute the command and get the newly inserted ID
          var newId = command.ExecuteScalar();

          return Ok(new { message = "Client added successfully.", id = newId });
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }

    // READ
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

    // UPDATE
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

          // Add a parameter to capture the return value
          var returnValue = new SqlParameter("@ReturnVal", SqlDbType.Int)
          {
            Direction = ParameterDirection.ReturnValue
          };
          command.Parameters.Add(returnValue);

          command.ExecuteNonQuery();

          int result = (int)returnValue.Value;
          Console.WriteLine($"Update result: {result}");
          if (result > 0)
          {
            return Ok(new { message = "Client updated successfully." });
          }
          else
          {
            return NotFound(new { message = "Client not found." });
          }
        }
      }
      catch (Exception ex)
      {
        Console.WriteLine($"An error occurred: {ex.Message}"); 
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }

    // DELETE
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

    // ***************************************** PLANTS ************************************************************

    // CREATE
    [HttpPost]
    [Route("plants/add")]
    public IActionResult AddPlant([FromBody] Plants plant)
    {
      try
      {
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("sp_ins_plants", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@name_plant", plant.name_plant));
          command.Parameters.Add(new SqlParameter("@inicio_contrato", plant.inicio_contrato));
          command.Parameters.Add(new SqlParameter("@fin_contrato", plant.fin_contrato));
          command.Parameters.Add(new SqlParameter("@cmd", plant.cmd));
          command.Parameters.Add(new SqlParameter("@unidad", plant.unidad));
          command.Parameters.Add(new SqlParameter("@id_client", plant.id_client));

          var newId = command.ExecuteScalar();

          return Ok(new { message = "Plant added successfully.", id = newId });
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }

    // READ
    [HttpGet]
    [Route("plants/consulta")]
    public IActionResult GetPlantsByClientId(int id_client)
    {
      try
      {
        List<Plants> plants = new List<Plants>();
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("sp_get_plants_by_client_id", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@id_client", id_client));

          using (var reader = command.ExecuteReader())
          {
            while (reader.Read())
            {
              var plant = new Plants
              {
                id_plant = reader.GetInt32(reader.GetOrdinal("id_plant")),
                name_plant = reader.GetString(reader.GetOrdinal("name_plant")),
                inicio_contrato = reader.GetDateTime(reader.GetOrdinal("inicio_contrato")),
                fin_contrato = reader.GetDateTime(reader.GetOrdinal("fin_contrato")),
                cmd = reader.GetDouble(reader.GetOrdinal("cmd")),
                unidad = reader.GetString(reader.GetOrdinal("unidad")),
                id_client = reader.GetInt32(reader.GetOrdinal("id_client"))
              };
              plants.Add(plant);
            }
          }
        }
        return Ok(plants);
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }


    // UPDATE
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
          var command = new SqlCommand("sp_upd_plants", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@id_plant", plant.id_plant));
          command.Parameters.Add(new SqlParameter("@name_plant", plant.name_plant));
          command.Parameters.Add(new SqlParameter("@inicio_contrato", plant.inicio_contrato));
          command.Parameters.Add(new SqlParameter("@fin_contrato", plant.fin_contrato));
          command.Parameters.Add(new SqlParameter("@cmd", plant.cmd));
          command.Parameters.Add(new SqlParameter("@unidad", plant.unidad));
          command.Parameters.Add(new SqlParameter("@id_client", plant.id_client));

          var returnValue = new SqlParameter("@ReturnVal", SqlDbType.Int)
          {
            Direction = ParameterDirection.ReturnValue
          };
          command.Parameters.Add(returnValue);

          command.ExecuteNonQuery();

          int result = (int)returnValue.Value;
          if (result == -1)
          {
            return NotFound(new { message = "Plant not found." });
          }
          else
          {
            return Ok(new { message = "Plant updated successfully." });
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }


    // DELETE
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

            // Execute the command and check the return value
            var returnValue = new SqlParameter("@ReturnVal", SqlDbType.Int)
            {
              Direction = ParameterDirection.ReturnValue
            };
            command.Parameters.Add(returnValue);

            command.ExecuteNonQuery();

            int result = (int)returnValue.Value;
            if (result == -1)
            {
              return NotFound(new { message = "Plant not found." });
            }
            else
            {
              return Ok(new { message = "Plant successfully deleted." });
            }
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"Error deleting plant: {ex.Message}" });
      }
    }



    // ************************************************ WORST CASE *************************************************************************


    // INSERT (Insert New WC Records)
    [HttpPost("worstcase/insert")]
    public IActionResult InsertWC([FromBody] List<WC> wcs)
    {
      if (wcs == null || wcs.Count == 0)
      {
        return BadRequest(new { error = "No records provided." });
      }

      try
      {
        using (SqlConnection connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();

          foreach (var wc in wcs)
          {
            SqlCommand command = new SqlCommand("sp_ins_wc_alt", connection)
            {
              CommandType = CommandType.StoredProcedure
            };
            command.Parameters.Add(new SqlParameter("@index_name", SqlDbType.VarChar) { Value = wc.index_name });
            command.Parameters.Add(new SqlParameter("@period_case", SqlDbType.DateTime) { Value = wc.period_case });
            command.Parameters.Add(new SqlParameter("@wc_price", SqlDbType.Decimal) { Value = wc.wc_price });

            command.ExecuteNonQuery();
          }
        }

        return Ok(new { message = "wc inserted successfully." });
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }





    // READ
    [HttpGet]
    [Route("worstcase/consulta")]
    public IActionResult getWC()
    {
      Console.WriteLine("getWC() method called.");
      try
      {
        List<WC> wcs = new List<WC>();
        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand command = new SqlCommand("sp_get_wc", conexion)
        {
          CommandType = CommandType.StoredProcedure
        };

        conexion.Open();
        using (SqlDataReader reader = command.ExecuteReader())
        {
          while (reader.Read())
          {
            WC wc = new WC
            {
              index_name = reader.GetString(reader.GetOrdinal("index_name")),
              period_case = reader.GetDateTime(reader.GetOrdinal("period_case")),
              wc_price = reader.GetDecimal(reader.GetOrdinal("wc_price")),
              id = reader.GetInt32(reader.GetOrdinal("id"))
            };
            wcs.Add(wc);
          }
        }
        conexion.Close();
        return Ok(wcs);
      }
      catch (Exception ex)
      {
        return BadRequest($"An error occurred: {ex.Message}");
      }
    }

    // UPDATE
    [HttpPut("worstcase/update/{id}")]
    public IActionResult UpdateWC(int id, [FromBody] WC wc)
    {
      try
      {
        if (id != wc.id)
        {
          return BadRequest("Worst Case ID mismatch");
        }

        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("sp_upd_wc", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@id", wc.id));
          command.Parameters.Add(new SqlParameter("@index_name", wc.index_name));
          command.Parameters.Add(new SqlParameter("@period_case", wc.period_case));
          command.Parameters.Add(new SqlParameter("@wc_price", wc.wc_price));

          var returnValue = new SqlParameter("@ReturnVal", SqlDbType.Int)
          {
            Direction = ParameterDirection.ReturnValue
          };
          command.Parameters.Add(returnValue);

          command.ExecuteNonQuery();

          int result = (int)returnValue.Value;
          if (result == -1)
          {
            return NotFound(new { message = "Worst Case not found." });
          }
          else
          {
            return Ok(new { message = "wc updated successfully." });
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }

    // DELETE
    [HttpDelete("worstcase/{id}")]
    public IActionResult DeleteWC(int id)
    {
      try
      {
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          using (var command = new SqlCommand("sp_del_wc", connection))
          {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@id", SqlDbType.Int) { Value = id });

            command.ExecuteNonQuery();
          }
          connection.Close();
          return Ok(new { message = "Worst case successfully deleted." });
        }
      }
      catch (Exception ex)
      {
        return BadRequest($"Error deleting Worst Case: {ex.Message}");
      }
    }

    // CREATE
    [HttpPost]
    [Route("worstcase/add")]
    public IActionResult AddWC([FromBody] WC wc)
    {
      try
      {
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("sp_ins_wc", connection)
          {
            CommandType = CommandType.StoredProcedure
          };
          command.Parameters.Add(new SqlParameter("@index_name", SqlDbType.VarChar) { Value = wc.index_name });
          command.Parameters.Add(new SqlParameter("@period_case", SqlDbType.Date) { Value = wc.period_case });
          command.Parameters.Add(new SqlParameter("@wc_price", SqlDbType.Decimal) { Value = wc.wc_price });

          command.ExecuteNonQuery();

          command = new SqlCommand("SELECT TOP 1 * FROM worst_case ORDER BY period_case DESC", connection);
          var reader = command.ExecuteReader();
          if (reader.Read())
          {
            var newWC = new WC
            {
              id = (int)reader["id"],
              index_name = (string)reader["index_name"],
              period_case = (DateTime)reader["period_case"],
              wc_price = (Decimal)reader["wc_price"],
            };
            return Ok(newWC);
          }
          else
          {
            throw new Exception("Failed to retrieve new Worst Case data.");
          }
        }
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }

    [HttpGet]
    [Route("index-types/names")]
    public IActionResult GetIndexNames()
    {
      try
      {
        List<string> indexNames = new List<string>();
        using (SqlConnection connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          var command = new SqlCommand("SELECT index_name FROM index_types", connection);

          using (SqlDataReader reader = command.ExecuteReader())
          {
            while (reader.Read())
            {
              indexNames.Add(reader.GetString(reader.GetOrdinal("index_name")));
            }
          }
        }

        return Ok(indexNames);
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = $"An error occurred: {ex.Message}" });
      }
    }


  }



}
