using Coberturas.Contexts;
using Coberturas.Models;
using Coberturas.Models.Trades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Coberturas.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class FiltrosTradeController : Controller
  {
    private readonly ConnectionSQL _context;

    public FiltrosTradeController(ConnectionSQL context)
    {
      _context = context;
    }



    [HttpGet]
    [Route("ListTradeType")]
    public IActionResult TradeType()
    {
      try
      {
        List<TradeType> data = new List<TradeType>();

        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando = conexion.CreateCommand();
        conexion.Open();
        comando.CommandType = System.Data.CommandType.StoredProcedure;
        comando.CommandText = "sp_get_trade_types";

        //comando.Parameters.Add("idwfc", System.Data.SqlDbType.VarChar, 255).Value = idwfc;

        SqlDataReader reader = comando.ExecuteReader();
        while (reader.Read())
        {
          TradeType array = new TradeType();

          array.id_type = (int)reader["id_type"];
          array.trade_type = (string)reader["trade_type"];               

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

    [HttpGet]
    [Route("ListBanks")]
    public IActionResult Banks()
    {
      try
      {
        List<Banks> data = new List<Banks>();

        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando = conexion.CreateCommand();
        conexion.Open();
        comando.CommandType = System.Data.CommandType.StoredProcedure;
        comando.CommandText = "sp_get_banks";

        //comando.Parameters.Add("idwfc", System.Data.SqlDbType.VarChar, 255).Value = idwfc;

        SqlDataReader reader = comando.ExecuteReader();
        while (reader.Read())
        {
          Banks array = new Banks();

          array.id_bank = (int)reader["id_bank"];
          array.bank = (string)reader["bank"];
          array.CSA = (int)reader["CSA"];

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


    [HttpGet]
    [Route("ListCurrency")]
    public IActionResult ListCurrency()
    {
      try
      {
        List<Currency> data = new List<Currency>();

        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando = conexion.CreateCommand();
        conexion.Open();
        comando.CommandType = System.Data.CommandType.StoredProcedure;
        comando.CommandText = "sp_get_currency_types";

        //comando.Parameters.Add("idwfc", System.Data.SqlDbType.VarChar, 255).Value = idwfc;

        SqlDataReader reader = comando.ExecuteReader();
        while (reader.Read())
        {
          Currency array = new Currency();

          array.id_currency = (int)reader["id_currency"];
          array.currency_name = (string)reader["currency_name"];          

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


    [HttpGet]
    [Route("ListHedgeTypes")]
    public IActionResult HedgeTypes()
    {
      try
      {
        List<HedgeTypes> data = new List<HedgeTypes>();

        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando = conexion.CreateCommand();
        conexion.Open();
        comando.CommandType = System.Data.CommandType.StoredProcedure;
        comando.CommandText = "sp_get_hedge_types";

        //comando.Parameters.Add("idwfc", System.Data.SqlDbType.VarChar, 255).Value = idwfc;

        SqlDataReader reader = comando.ExecuteReader();
        while (reader.Read())
        {
          HedgeTypes array = new HedgeTypes();

          array.id_hedge_type = (int)reader["id_hedge_type"];
          array.hedge_type = (string)reader["hedge_type"];

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


    [HttpGet]
    [Route("ListIndexTypes")]
    public IActionResult IndexTypes()
    {
      try
      {
        List<IndexTypes> data = new List<IndexTypes>();

        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando = conexion.CreateCommand();
        conexion.Open();
        comando.CommandType = System.Data.CommandType.StoredProcedure;
        comando.CommandText = "sp_get_index_types";

        //comando.Parameters.Add("idwfc", System.Data.SqlDbType.VarChar, 255).Value = idwfc;

        SqlDataReader reader = comando.ExecuteReader();
        while (reader.Read())
        {
          IndexTypes array = new IndexTypes();

          array.id_index = (int)reader["id_index"];
          array.index_name = (string)reader["index_name"]; 
          array.index_symbol = (string?)reader["index_symbol"]; //validar el null
          array.source = (string?)reader["source"]; //validar el null

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

    [HttpGet]
    [Route("ListInstruments")]
    public IActionResult Instruments()
    {
      try
      {
        List<Instruments> data = new List<Instruments>();

        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando = conexion.CreateCommand();
        conexion.Open();
        comando.CommandType = System.Data.CommandType.StoredProcedure;
        comando.CommandText = "sp_get_instruments";

        //comando.Parameters.Add("idwfc", System.Data.SqlDbType.VarChar, 255).Value = idwfc;

        SqlDataReader reader = comando.ExecuteReader();
        while (reader.Read())
        {
          Instruments array = new Instruments();

          array.id_instrument = (int)reader["id_instrument"];
          array.instrument = (string)reader["instrument"];

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


    [HttpGet]
    [Route("ListOperationTypes")]
    public IActionResult OperationTypes()
    {
      try
      {
        List<OperationsTypes> data = new List<OperationsTypes>();

        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando = conexion.CreateCommand();
        conexion.Open();
        comando.CommandType = System.Data.CommandType.StoredProcedure;
        comando.CommandText = "sp_get_operation_types";

        //comando.Parameters.Add("idwfc", System.Data.SqlDbType.VarChar, 255).Value = idwfc;

        SqlDataReader reader = comando.ExecuteReader();
        while (reader.Read())
        {
          OperationsTypes array = new OperationsTypes();

          array.id_operation = (int)reader["id_operation"];
          array.operation_name = (string)reader["operation_name"];

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


    [HttpGet]
    [Route("ListSars")]
    public IActionResult ListSars()
    {
      try
      {
        List<SAR> data = new List<SAR>();

        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando = conexion.CreateCommand();
        conexion.Open();
        comando.CommandType = System.Data.CommandType.StoredProcedure;
        comando.CommandText = "sp_get_sars";

        //comando.Parameters.Add("idwfc", System.Data.SqlDbType.VarChar, 255).Value = idwfc;

        SqlDataReader reader = comando.ExecuteReader();
        while (reader.Read())
        {
          SAR array = new SAR();

          array.id_sar = (int)reader["id_sar"];
          array.number_sar = (string)reader["number_sar"];

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

    [HttpGet]
    [Route("ListVolumeBasis")]
    public IActionResult VolumeBasis()
    {
      try
      {
        List<VolumeBasis> data = new List<VolumeBasis>();

        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando = conexion.CreateCommand();
        conexion.Open();
        comando.CommandType = System.Data.CommandType.StoredProcedure;
        comando.CommandText = "sp_get_volume_basis";

        //comando.Parameters.Add("idwfc", System.Data.SqlDbType.VarChar, 255).Value = idwfc;

        SqlDataReader reader = comando.ExecuteReader();
        while (reader.Read())
        {
          VolumeBasis array = new VolumeBasis();

          array.id_volume_basis = (int)reader["id_volume_basis"];
          array.volume_basis = (string)reader["volume_basis"];

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

    [HttpGet]
    [Route("ListVolumeUnits")]
    public IActionResult VolumeUnit()
    {
      try
      {
        List<VolumeUnit> data = new List<VolumeUnit>();

        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando = conexion.CreateCommand();
        conexion.Open();
        comando.CommandType = System.Data.CommandType.StoredProcedure;
        comando.CommandText = "sp_get_volume_units";

        //comando.Parameters.Add("idwfc", System.Data.SqlDbType.VarChar, 255).Value = idwfc;

        SqlDataReader reader = comando.ExecuteReader();
        while (reader.Read())
        {
          VolumeUnit array = new VolumeUnit();

          array.id_unit = (int)reader["id_unit"];
          array.volume_unit = (string)reader["volume_unit"];

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

    [HttpGet]
    [Route("ListClients")]
    public IActionResult ListClients()
    {
      try
      {
        List<Clients> data = new List<Clients>();

        SqlConnection conexion = (SqlConnection)_context.Database.GetDbConnection();
        SqlCommand comando = conexion.CreateCommand();
        conexion.Open();
        comando.CommandType = System.Data.CommandType.StoredProcedure;
        comando.CommandText = "sp_get_clients";

        //comando.Parameters.Add("idwfc", System.Data.SqlDbType.VarChar, 255).Value = idwfc;

        SqlDataReader reader = comando.ExecuteReader();
        while (reader.Read())
        {
          Clients array = new Clients();

          array.id_client = (int)reader["id_client"];
          array.client = (string)reader["client"];
          array.holding = (string)reader["holding"];

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

  }
}
