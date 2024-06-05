using Coberturas.Contexts;
using Coberturas.Models;
using Coberturas.Models.Trades;
using Coberturas.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

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
    public IActionResult NewTrade(List<Trade> trades)
    {
      try
      {
        foreach (var t in trades) {

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
          catch(Exception ex) {
            return BadRequest(ex);
          }
        }
        return Ok("Trade creado satisfactoriamente");
      }
      catch (Exception ex)
      {
        return BadRequest(ex);
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
          array.effective_price = (Decimal)reader["effective_price"];

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
        using (var connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();
          foreach (var i in listMovs)
          {
            using (var command = connection.CreateCommand())
            {
              command.CommandType = CommandType.StoredProcedure;
              command.CommandText = "sp_settle_trades";
              //command.Parameters.Add(new SqlParameter("@id_mov", id_mov));
              command.Parameters.Add("id_mov", System.Data.SqlDbType.Int).Value = i.id_mov;
              command.Parameters.Add("action", System.Data.SqlDbType.NVarChar, 10).Value = i.action; 

              command.ExecuteNonQuery();
            }
          }
          return Ok("Trades have been successfully settled.");
        }
      }
      catch (Exception ex)
      {
        return BadRequest($"An error occurred: {ex.Message}");
      }

      }

    }
  }
