using Coberturas.Contexts;
using Coberturas.Models;
using Coberturas.Models.Trades;
using Coberturas.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using CsvHelper;
using System.Globalization;
using CsvHelper.Configuration;
using System.IO;
using CsvHelper.TypeConversion;

public class SafeTypeConverter<T> : DefaultTypeConverter
{
  public override object ConvertFromString(string text, IReaderRow row, MemberMapData memberMapData)
  {
    if (string.IsNullOrWhiteSpace(text) || text.Trim().Equals("NaN", StringComparison.OrdinalIgnoreCase) ||
        text.Trim().Equals("#N/A", StringComparison.OrdinalIgnoreCase))
    {
      return GetDefaultValue(typeof(T));  // ✅ Use default values dynamically
    }

    try
    {
      return Convert.ChangeType(text, typeof(T), CultureInfo.InvariantCulture);
    }
    catch
    {
      return GetDefaultValue(typeof(T)); // ✅ If conversion fails, return a safe fallback
    }
  }

  private object GetDefaultValue(Type type)
  {
    if (type == typeof(string)) return string.Empty;
    if (type == typeof(int) || type == typeof(int?)) return 0;
    if (type == typeof(decimal) || type == typeof(decimal?)) return 0.00m;
    if (type == typeof(DateTime) || type == typeof(DateTime?)) return DateTime.MinValue;
    return null!;
  }
}

namespace Coberturas.Controllers
{

  [ApiController]
  [Route("[controller]")]
  public class TradeController : Controller
  {
    private readonly ConnectionSQL _context;

    public TradeController(ConnectionSQL context)
    {
      _context = context;      
    }


    [HttpPost]
    [Route("NewTrade")]
    public IActionResult NewTrade([FromForm] IFormFile file)
    {
      try
      {
        // Validate if the file exists
        if (file == null || file.Length == 0)
        {
          return BadRequest("No file provided or the file is empty.");
        }

        // Debugging: Log the content type
        Console.WriteLine($"Received file: {file.FileName}, Content-Type: {file.ContentType}");

        // Ensure the file has a valid Content-Type for CSV
        if (!file.ContentType.Equals("text/csv", StringComparison.OrdinalIgnoreCase) &&
            !file.ContentType.Equals("application/vnd.ms-excel", StringComparison.OrdinalIgnoreCase))
        {
          return BadRequest("Invalid file type. Please upload a CSV file.");
        }

        // Read the file stream
        using var stream = file.OpenReadStream();
        using var reader = new StreamReader(stream, System.Text.Encoding.UTF8);

        // Parse the CSV content
        var csvContent = reader.ReadToEnd().Trim('\ufeff'); // Remove BOM
        Console.WriteLine("📝 CSV Content Received:\n" + csvContent);
        var trades = ParseCsvToTrades(csvContent);

        // Process each trade
        foreach (var trade in trades)
        {
          InsertTradeIntoDatabase(trade);
        }

        return Ok($"{trades.Count} trades processed successfully.");
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    private List<Trade> ParseCsvToTrades(string csvContent)
    {
      csvContent = csvContent.Trim('\ufeff'); // Remove BOM if present
      Console.WriteLine("📝 CSV Content After Cleanup:\n" + csvContent);

      var tradeList = new List<Trade>();

      using (var reader = new StringReader(csvContent))
      using (var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
      {
        HasHeaderRecord = true,
        IgnoreBlankLines = true,
        TrimOptions = TrimOptions.Trim,
        HeaderValidated = null,
        MissingFieldFound = null,
        BadDataFound = args => Console.WriteLine($"⚠️ Bad data found: {args.Field}"),
      }))
      {
        try
        {
          var csvTrades = csv.GetRecords<TradeCsvDTO>().ToList();

          foreach (var csvTrade in csvTrades)
          {
            var trade = new Trade
            {
              id_neg = csvTrade.id_neg,
              settled = csvTrade.settled,
              id_trade_type = csvTrade.id_trade_type,
              bank_leg = csvTrade.bank_leg,
              counterparty = csvTrade.counterparty,
              trade_date = csvTrade.trade_date,
              id_sar = csvTrade.id_sar,
              trade_month = csvTrade.trade_month,
              id_instrument = csvTrade.id_instrument,
              id_hedge_type = csvTrade.id_hedge_type,
              id_index = csvTrade.id_index,
              id_volume_basis = csvTrade.id_volume_basis,
              id_operation = csvTrade.id_operation,
              id_currency = csvTrade.id_currency,
              vol_daily = csvTrade.vol_daily,
              vol_monthly = csvTrade.vol_monthly,
              price = csvTrade.price,
              id_unit = csvTrade.id_unit,
              id_bank = csvTrade.id_bank,
              id_plant = csvTrade.id_plant,
              market_price = csvTrade.market_price,
              bloomberg_curr = csvTrade.bloomberg_curr,
              worstcase_curr = csvTrade.worstcase_curr,
              mtm_usd = csvTrade.mtm_usd,
              worstcase_usd = csvTrade.worstcase_usd,
              wc_price = csvTrade.wc_price,
            };

            Console.WriteLine($"✅ Parsed Trade: ID_NEG={trade.id_neg}, Volume={trade.vol_monthly}, Date={trade.trade_date}");
            tradeList.Add(trade);
          }

          Console.WriteLine($"📌 Total trades parsed: {tradeList.Count}");
        }
        catch (Exception ex)
        {
          Console.WriteLine($"❌ Error parsing CSV: {ex.Message}");
        }
      }

      return tradeList;
    }



    // Helper Method: Insert a Trade into the Database
    private void InsertTradeIntoDatabase(Trade trade)
    {
      try
      {
        var connectionString = _context.Database.GetConnectionString();
        using SqlConnection connection = new SqlConnection(connectionString);
        using SqlCommand command = connection.CreateCommand();
        connection.Open();

        command.CommandType = CommandType.StoredProcedure;
        command.CommandText = "sp_ins_trade";

        // DEBUG: Log the trade being inserted
        Console.WriteLine($"🔹 Inserting Trade - ID_NEG: {trade.id_neg}, Trade Type: {trade.id_trade_type}, Volume: {trade.vol_monthly}, Price: {trade.price}");
        // Check if data is valid
        if (string.IsNullOrEmpty(trade.id_neg) || trade.id_trade_type == 0)
        {
          Console.WriteLine($"⚠️ Trade ID {trade.id_neg} is missing required fields. Skipping.");
          return;
        }

        //command.Parameters.AddWithValue("@id_trade", DBNull.Value);
        command.Parameters.AddWithValue("id_neg", string.IsNullOrEmpty(trade.id_neg) ? DBNull.Value : trade.id_neg);
        command.Parameters.AddWithValue("settled", trade.settled ? 1 : 0);
        command.Parameters.AddWithValue("id_trade_type", trade.id_trade_type);
        command.Parameters.AddWithValue("bank_leg", trade.bank_leg ? 1 : 0);
        command.Parameters.AddWithValue("counterparty", trade.counterparty);
        command.Parameters.AddWithValue("trade_date", trade.trade_date);
        command.Parameters.AddWithValue("id_sar", trade.id_sar);
        command.Parameters.AddWithValue("trade_month", trade.trade_month);
        command.Parameters.AddWithValue("id_instrument", trade.id_instrument);
        command.Parameters.AddWithValue("id_hedge_type", trade.id_hedge_type);
        command.Parameters.AddWithValue("id_index", trade.id_index);
        command.Parameters.AddWithValue("id_volume_basis", trade.id_volume_basis);
        command.Parameters.AddWithValue("id_operation", trade.id_operation);
        command.Parameters.AddWithValue("id_currency", trade.id_currency);
        command.Parameters.AddWithValue("vol_daily", trade.vol_daily);
        command.Parameters.AddWithValue("vol_monthly", trade.vol_monthly);
        command.Parameters.AddWithValue("price", trade.price);
        command.Parameters.AddWithValue("id_unit", trade.id_unit);
        command.Parameters.AddWithValue("id_bank", trade.id_bank ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("id_plant", trade.id_plant ?? (object)DBNull.Value);
        command.Parameters.AddWithValue("wc_price", trade.wc_price);
        command.Parameters.AddWithValue("bloomberg_curr", trade.bloomberg_curr);
        command.Parameters.AddWithValue("worstcase_curr", trade.worstcase_curr);
        command.Parameters.AddWithValue("mtm_usd", trade.mtm_usd);
        command.Parameters.AddWithValue("worstcase_usd", trade.worstcase_usd);

        Console.WriteLine($"🔹 Inserting Trade: {trade.id_neg} | {trade.trade_date} | {trade.price}");
        int rowsAffected = command.ExecuteNonQuery();

        Console.WriteLine($"✅ Rows Affected: {rowsAffected}");

        if (rowsAffected == 0)
        {
          Console.WriteLine("⚠️ No rows were inserted. Check stored procedure or constraints.");
        }

        connection.Close();
      }
      catch (Exception ex)
      {
        Console.WriteLine($"❌ Error inserting trade {trade.id_trade}: {ex.Message}");
        throw new Exception($"Error inserting trade {trade.id_trade}: {ex.Message}");
      }
    }





    [HttpPost]
    [Route("GetHistoryTrades")]
    public IActionResult GetTrades(DateRange dates)
    {
      try
      {
        List<Trade> data = new List<Trade>();

        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando = conexion.CreateCommand();
        conexion.Open();
        comando.CommandType = System.Data.CommandType.StoredProcedure;
        comando.CommandText = "sp_get_history_trades";

        comando.Parameters.Add("fecha1", System.Data.SqlDbType.Date).Value = dates.fecha1;
        comando.Parameters.Add("fecha2", System.Data.SqlDbType.Date).Value = dates.fecha2;

        SqlDataReader reader = comando.ExecuteReader();
        while (reader.Read())
        {
          Trade array = new Trade();

          array.id_mov = (int)reader["id_mov"];
          array.id_trade = reader["id_trade"] != DBNull.Value ? (string)reader["id_trade"] : null;
          array.id_neg = reader["id_neg"] != DBNull.Value ? (string)reader["id_neg"] : null;
          array.settled = (bool)reader["settled"];
          array.id_trade_type = (int)reader["id_trade_type"];
          array.trade_type_name = reader["trade_type"] != DBNull.Value ? (string)reader["trade_type"] : null;
          array.bank_leg = (bool)reader["bank_leg"];
          array.trade_date = (DateTime)reader["trade_date"];
          array.id_sar = (int)reader["id_sar"];
          array.number_sar = reader["number_sar"] != DBNull.Value ? (string)reader["number_sar"] : null;
          array.trade_month = (DateTime)reader["trade_month"];
          array.id_instrument = (int)reader["id_instrument"];
          array.instrument = reader["instrument"] != DBNull.Value ? (string)reader["instrument"] : null;
          array.id_hedge_type = (int)reader["id_hedge_type"];
          array.hedge_type = reader["hedge_type"] != DBNull.Value ? (string)reader["hedge_type"] : null;
          array.id_index = (int)reader["id_index"];
          array.index_name = reader["index_name"] != DBNull.Value ? (string)reader["index_name"] : null;
          array.index_symbol_B = reader["index_symbol_B"] != DBNull.Value ? (string)reader["index_symbol_B"] : null;
          array.id_volume_basis = (int)reader["id_volume_basis"];
          array.volume_basis = reader["volume_basis"] != DBNull.Value ? (string)reader["volume_basis"] : null;
          array.id_operation = (int)reader["id_operation"];
          array.operation = reader["operation_name"] != DBNull.Value ? (string)reader["operation_name"] : null;
          array.id_currency = (int)reader["id_currency"];
          array.currency_name = reader["currency_name"] != DBNull.Value ? (string)reader["currency_name"] : null;
          array.vol_daily = (decimal)reader["vol_daily"];
          array.vol_monthly = (decimal)reader["vol_monthly"];
          array.price = (decimal)reader["price"];
          array.id_unit = (int)reader["id_unit"];
          array.volume_unit = reader["volume_unit"] != DBNull.Value ? (string)reader["volume_unit"] : null;

          array.id_bank = reader["id_bank"] != DBNull.Value ? (int?)reader["id_bank"] : null;
          array.bank = reader["bank"] != DBNull.Value ? (string)reader["bank"] : null;
          array.id_plant = reader["id_plant"] != DBNull.Value ? (int?)reader["id_plant"] : null;
          array.client = reader["client"] != DBNull.Value ? (string)reader["client"] : null;
          array.market_price = reader["market_price"] != DBNull.Value ? (decimal?)reader["market_price"] : null;
          array.wc_price = reader["wc_price"] != DBNull.Value ? (decimal)reader["wc_price"] : 0;
          array.bloomberg_curr = reader["bloomberg_curr"] != DBNull.Value ? (decimal)reader["bloomberg_curr"] : 0;
          array.worstcase_curr = reader["worstcase_curr"] != DBNull.Value ? (decimal)reader["worstcase_curr"] : 0;
          array.mtm_usd = reader["mtm_usd"] != DBNull.Value ? (decimal)reader["mtm_usd"] : 0;
          array.worstcase_usd = reader["worstcase_usd"] != DBNull.Value ? (decimal)reader["worstcase_usd"] : 0;

          data.Add(array);
        }
        conexion.Close();

        var result = new ResponseGeneral() { msg = "Consulta Realizada", data = data, success = true };
        return Ok(result);
      }
      catch (SqlException sqlEx)
      {
        // Log detailed SQL exceptions
        Console.WriteLine($"SQL Error: {sqlEx.Message}, StackTrace: {sqlEx.StackTrace}");
        return StatusCode(500, new { error = "Database error occurred. Please check your query." });
      }
      catch (Exception ex)
      {
        return StatusCode(500, new
        {
          error = "Error inesperado en el servidor.",
          message = ex.Message,
          stackTrace = ex.StackTrace
        });
      }

    }

    [HttpPost]
    [Route("GetTradeWithId")]
    public IActionResult GetTradeWithId(TradeWithId trade)
    {
      try
      {
        List<Trade> data = new List<Trade>();

        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando = conexion.CreateCommand();
        conexion.Open();
        comando.CommandType = System.Data.CommandType.StoredProcedure;
        comando.CommandText = "sp_get_trade_with_id";

        comando.Parameters.Add("id_trade", System.Data.SqlDbType.VarChar).Value = trade.id_trade;

        SqlDataReader reader = comando.ExecuteReader();
        while (reader.Read())
        {
          Trade array = new Trade();

          array.id_mov = (int)reader["id_mov"];
          array.id_trade = (string)reader["id_trade"];
          array.id_neg = (string?)reader["id_neg"];
          array.settled = (Boolean)reader["settled"];
          array.id_trade_type = (int)reader["id_trade_type"];
          array.trade_type_name = (string)reader["trade_type"];
          array.bank_leg = (Boolean)reader["bank_leg"];
          //array.counterparty = (int)reader["counterparty"];
          array.trade_date = (DateTime)reader["trade_date"];
          array.id_sar = (int)reader["id_sar"];
          array.number_sar = (string)reader["number_sar"];
          array.trade_month = (DateTime)reader["trade_month"];
          array.id_instrument = (int)reader["id_instrument"];
          array.instrument = (string)reader["instrument"];
          array.id_hedge_type = (int)reader["id_hedge_type"];
          array.hedge_type = (string)reader["hedge_type"];
          array.id_index = (int)reader["id_index"];
          array.index_name = (string)reader["index_name"];
          array.id_volume_basis = (int)reader["id_volume_basis"];
          array.volume_basis = (string)reader["volume_basis"];
          array.id_operation = (int)reader["id_operation"];
          array.operation = (string)reader["operation_name"];
          array.id_currency = (int)reader["id_currency"];
          array.currency_name = (string)reader["currency_name"];
          array.vol_daily = (Decimal)reader["vol_daily"];
          array.vol_monthly = (Decimal)reader["vol_monthly"];
          array.price = (Decimal)reader["price"];
          array.id_unit = (int)reader["id_unit"];
          array.volume_unit = (string)reader["volume_unit"];
          array.id_bank = reader["id_bank"] == DBNull.Value ? null : (int)reader["id_bank"];
          array.bank = reader["bank"] == DBNull.Value ? null : (string)reader["bank"];
          array.id_plant = reader["id_plant"] == DBNull.Value ? null : (int)reader["id_plant"];
          array.client = reader["client"] == DBNull.Value ? null : (string)reader["client"];

          data.Add(array);
        }
        conexion.Close();

        var result = new ResponseGeneral() { msg = "Consulta Realizada", data = data, success = true };
        return Ok(result);
      }
      catch (Exception ex)
      {
        return BadRequest(ex);
      }
    }

    [HttpPost]
    [Route("UpdateTrade")]
    public IActionResult UpdateTrade(List<Trade> trades)
    {
      try
      {
        //Primero, elimino los trade registrados con el id_trade
        SqlConnection conexion1 = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando1 = conexion1.CreateCommand();
        conexion1.Open();
        comando1.CommandType = System.Data.CommandType.StoredProcedure;
        comando1.CommandText = "sp_del_trade";
        comando1.Parameters.Add("id_trade", System.Data.SqlDbType.VarChar, 255).Value = trades[0].id_trade;
        SqlDataReader reader1 = comando1.ExecuteReader();
        conexion1.Close();


        //Despues inserto como nuevos. 
        foreach (var t in trades)
        {

          try
          {
            SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
            SqlCommand comando = conexion.CreateCommand();
            conexion.Open();
            comando.CommandType = System.Data.CommandType.StoredProcedure;
            comando.CommandText = "sp_ins_trade";

            comando.Parameters.Add("id_trade", System.Data.SqlDbType.VarChar, 255).Value = t.id_trade;
            comando.Parameters.Add("id_neg", System.Data.SqlDbType.VarChar, 255).Value = t.id_neg == "" ? DBNull.Value : t.id_neg;
            comando.Parameters.Add("settled", System.Data.SqlDbType.Bit).Value = t.settled == true ? 1 : 0;
            comando.Parameters.Add("id_trade_type", System.Data.SqlDbType.Int).Value = t.id_trade_type;
            comando.Parameters.Add("bank_leg", System.Data.SqlDbType.Bit).Value = t.bank_leg == true ? 1 : 0; ;
            comando.Parameters.Add("counterparty", System.Data.SqlDbType.Int).Value = t.counterparty;
            comando.Parameters.Add("trade_date", System.Data.SqlDbType.Date).Value = t.trade_date;
            comando.Parameters.Add("id_sar", System.Data.SqlDbType.Int).Value = t.id_sar;
            comando.Parameters.Add("trade_month", System.Data.SqlDbType.Date).Value = t.trade_month;
            comando.Parameters.Add("id_instrument", System.Data.SqlDbType.Int).Value = t.id_instrument;
            comando.Parameters.Add("id_hedge_type", System.Data.SqlDbType.Int).Value = t.id_hedge_type;
            comando.Parameters.Add("id_index", System.Data.SqlDbType.Int).Value = t.id_index;
            comando.Parameters.Add("id_volume_basis", System.Data.SqlDbType.Int).Value = t.id_volume_basis;
            comando.Parameters.Add("id_operation", System.Data.SqlDbType.Int).Value = t.id_operation;
            comando.Parameters.Add("id_currency", System.Data.SqlDbType.Int).Value = t.id_currency;
            comando.Parameters.Add("vol_daily", System.Data.SqlDbType.Decimal).Value = t.vol_daily;
            comando.Parameters.Add("vol_monthly", System.Data.SqlDbType.Decimal).Value = t.vol_monthly;
            comando.Parameters.Add("price", System.Data.SqlDbType.Decimal).Value = t.price;
            comando.Parameters.Add("id_unit", System.Data.SqlDbType.Int).Value = t.id_unit;
            comando.Parameters.Add("id_bank", System.Data.SqlDbType.Int).Value = t.id_bank == null ? DBNull.Value : t.id_bank;
            comando.Parameters.Add("id_plant", System.Data.SqlDbType.Int).Value = t.id_plant == null ? DBNull.Value : t.id_plant;

            SqlDataReader reader = comando.ExecuteReader();
            conexion.Close();

            //var result = new ResponseGeneral() { msg = "Trade creado!", data = { }, success = true };
            //return Ok(result);
          }
          catch (Exception ex)
          {
            return BadRequest(ex);
          }
        }
        return Ok("Trade actualizado satisfactoriamente!");
      }
      catch (Exception ex)
      {
        return BadRequest(ex);
      }
    }

    [HttpPost]
    [Route("SettleTrades")]
    public IActionResult SettleTrades(List<SettledTrade> listMovs)
    {
      try
      {
        using (SqlConnection connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          foreach (var i in listMovs)
          {
            using (SqlCommand command = connection.CreateCommand())
            {
              command.CommandType = CommandType.StoredProcedure;
              command.CommandText = "sp_settle_trades";

              // Pass the ID of the movement and the action (settle or unsettle)
              command.Parameters.Add("id_mov", SqlDbType.Int).Value = i.id_mov;
              command.Parameters.Add("action", SqlDbType.NVarChar, 10).Value = i.action;

              // Execute the stored procedure
              command.ExecuteNonQuery();
            }
          }
          return Ok("Trades have been successfully settled/unsettled.");
        }
      }
      catch (Exception ex)
      {
        return BadRequest($"An error occurred: {ex.Message}");
      }
    }

    [HttpPost("update-calculated-trade-values")]
    public IActionResult UpdateCalculatedTradeValues([FromBody] List<TradeUpdateModel> updates)
    {
      try
      {
        using (SqlConnection connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();

          foreach (var update in updates)
          {
            using (SqlCommand command = connection.CreateCommand())
            {
              command.CommandType = CommandType.StoredProcedure;
              command.CommandText = "sp_update_calculated_values";

              command.Parameters.Add(new SqlParameter("@id_mov", SqlDbType.Int) { Value = update.IdMov });
              command.Parameters.Add(new SqlParameter("@market_price", SqlDbType.Decimal) { Value = update.MarketPrice });
              command.Parameters.Add(new SqlParameter("@bloomberg_curr", SqlDbType.Decimal) { Value = update.BloombergCurr });
              command.Parameters.Add(new SqlParameter("@worstcase_curr", SqlDbType.Decimal) { Value = update.WorstcaseCurr });
              command.Parameters.Add(new SqlParameter("@mtm_usd", SqlDbType.Decimal) { Value = update.MtmUsd });
              command.Parameters.Add(new SqlParameter("@worstcase_usd", SqlDbType.Decimal) { Value = update.WorstcaseUsd });
              command.Parameters.Add(new SqlParameter("@wc_price", SqlDbType.Decimal) { Value = update.wc_price });

              command.ExecuteNonQuery();
            }
          }
        }

        return Ok(new { message = "Calculated trade values updated successfully." });
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { error = ex.Message });
      }
    }



    [HttpPost("updateMarketPrice")]
    public IActionResult UpdateMarketPrice([FromBody] TradeMarketPriceUpdateRequest request)
    {
      try
      {
        using (SqlConnection connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          SqlCommand command = new SqlCommand("sp_update_market_price_B", connection)
          {
            CommandType = CommandType.StoredProcedure
          };

          command.Parameters.Add(new SqlParameter("@id_trade", SqlDbType.Int) { Value = request.IdTrade });
          command.Parameters.Add(new SqlParameter("@market_price", SqlDbType.Decimal) { Value = request.MarketPrice });

          command.ExecuteNonQuery();
        }

        return Ok(new { message = "Market price updated successfully." });
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { error = ex.Message });
      }
    }


  }
}
