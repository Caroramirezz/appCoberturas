using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;
using Coberturas.Contexts;
using Coberturas.Models.Bloomberg;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using Coberturas.Models.Trades;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace Coberturas.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class BloombergController : ControllerBase
  {
    private readonly ConnectionSQL _context;
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;

    private const string TokenUrl = "https://bsso.blpprofessional.com/ext/api/as/token.oauth2";
    private const string ClientId = "cfe709b933d32e465286b20a8469784f";
    private const string ClientSecret = "406d76415704eb4609a6fdd4d07f9743b44330d89bebe210696bdceb0a04a115";

    private const string TokenCacheKey = "BloombergToken";
    private const string TokenExpiryCacheKey = "BloombergTokenExpiry";

    public BloombergController(ConnectionSQL context, HttpClient httpClient, IMemoryCache cache)
    {
      _context = context;
      _httpClient = httpClient;
      _cache = cache;
    }

    public class BloombergDataRequest
    {
      public List<BloombergRecord> Records { get; set; }
    }

    [HttpPost("store")]
    public IActionResult StoreBloombergData([FromBody] BloombergDataRequest request)
    {
      Response.Headers.Add("Access-Control-Allow-Origin", Request.Headers["Origin"]);
      Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
      Response.Headers.Add("Access-Control-Allow-Headers", "Authorization, Content-Type");
      Response.Headers.Add("Access-Control-Allow-Credentials", "true");

      if (request.Records == null || request.Records.Count == 0)
      {
        return BadRequest(new { error = "No records provided." });
      }

      try
      {
        using (SqlConnection connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();

          foreach (var record in request.Records)
          {
            Console.WriteLine("Storing Bloomberg data with snapshot date: " + record.DLSnapshotStartTime);
            SqlCommand command = new SqlCommand("sp_ins_bloomberg_records", connection)
            {
              CommandType = CommandType.StoredProcedure
            };

            command.Parameters.Add(new SqlParameter("@DL_REQUEST_ID", SqlDbType.VarChar) { Value = record.DLRequestId });
            command.Parameters.Add(new SqlParameter("@DL_REQUEST_NAME", SqlDbType.VarChar) { Value = record.DLRequestName });
            command.Parameters.Add(new SqlParameter("@DL_SNAPSHOT_START_TIME", SqlDbType.DateTime) { Value = record.DLSnapshotStartTime });
            command.Parameters.Add(new SqlParameter("@DL_SNAPSHOT_TZ", SqlDbType.VarChar) { Value = record.DLSnapshotTz });
            command.Parameters.Add(new SqlParameter("@IDENTIFIER", SqlDbType.VarChar) { Value = record.Identifier });
            command.Parameters.Add(new SqlParameter("@RC", SqlDbType.VarChar) { Value = record.RC });
            command.Parameters.Add(new SqlParameter("@PX_SETTLE", SqlDbType.Decimal) { Value = record.PXSettle ?? (object)DBNull.Value });
            command.Parameters.Add(new SqlParameter("@PX_CLOSE_1D", SqlDbType.Decimal) { Value = record.PXClose1D ?? (object)DBNull.Value });
            command.Parameters.Add(new SqlParameter("@PX_CLOSE_1YR", SqlDbType.Decimal) { Value = record.PXClose1YR ?? (object)DBNull.Value });
            command.Parameters.Add(new SqlParameter("@PX_CLOSE_1M", SqlDbType.Decimal) { Value = record.PXClose1M ?? (object)DBNull.Value });
            command.Parameters.Add(new SqlParameter("@LAST_TRADEABLE_DT", SqlDbType.DateTime) { Value = record.LastTradeableDt ?? (object)DBNull.Value });
            command.Parameters.Add(new SqlParameter("@PX_LAST", SqlDbType.Decimal) { Value = record.PXLast ?? (object)DBNull.Value });

            command.ExecuteNonQuery();
          }
        }

        return Ok(new { message = "Records inserted successfully." });
      }
      catch (SqlException ex)
      {
        Console.WriteLine($"SQL Error: {ex.Message}");
        return BadRequest(new { error = $"SQL Error: {ex.Message}" });
      }
    }


    [HttpGet("GetBloombergRecords")]
    public async Task<IActionResult> GetBloombergRecords()
    {
      try
      {
        List<BloombergRecord> bloombergRecords = new List<BloombergRecord>();

        using (SqlConnection connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          connection.Open();

          var command = new SqlCommand("sp_get_bloomberg_records", connection)
          {
            CommandType = CommandType.StoredProcedure
          };

          using (var reader = await command.ExecuteReaderAsync())
          {
            while (await reader.ReadAsync())
            {
              bloombergRecords.Add(new BloombergRecord
              {
                Identifier = reader["IDENTIFIER"].ToString(),
                PXLast = reader["PX_LAST"] != DBNull.Value ? Convert.ToDouble(reader["PX_LAST"]) : (double?)null,
                LastTradeableDt = reader["LAST_TRADEABLE_DT"] != DBNull.Value ? (DateTime)reader["LAST_TRADEABLE_DT"] : (DateTime?)null
              });
            }
          }
        }

        return Ok(bloombergRecords);
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { error = ex.Message });
      }
    }

    [HttpGet("GetRecords")]
    public async Task<IActionResult> GetRecords(DateTime? startDate = null, DateTime? endDate = null, int page = 1, int pageSize = 100)
    {
      try
      {
        List<BloombergRecord> bloombergRecords = new List<BloombergRecord>();

        using (SqlConnection connection = (SqlConnection)_context.Database.GetDbConnection())
        {
          await connection.OpenAsync();

          var query = @"
                SELECT ID, DL_SNAPSHOT_START_TIME, IDENTIFIER, PX_LAST, LAST_TRADEABLE_DT
                FROM bloomberg_records
                WHERE (@startDate IS NULL OR LAST_TRADEABLE_DT >= @startDate)
                  AND (@endDate IS NULL OR LAST_TRADEABLE_DT <= @endDate)
                ORDER BY LAST_TRADEABLE_DT";


          using (var command = new SqlCommand(query, connection))
          {
            command.Parameters.AddWithValue("@startDate", (object?)startDate ?? DBNull.Value);
            command.Parameters.AddWithValue("@endDate", (object?)endDate ?? DBNull.Value);
            command.Parameters.AddWithValue("@Offset", (page - 1) * pageSize);
            command.Parameters.AddWithValue("@PageSize", pageSize);

            using (var reader = await command.ExecuteReaderAsync())
            {
              while (await reader.ReadAsync())
              {
                bloombergRecords.Add(new BloombergRecord
                {
                  Id = reader["ID"] != DBNull.Value ? Convert.ToInt32(reader["ID"]) : 0,
                  DLSnapshotStartTime = reader["DL_SNAPSHOT_START_TIME"] != DBNull.Value ? (DateTime)reader["DL_SNAPSHOT_START_TIME"] : (DateTime?)null,
                  Identifier = reader["IDENTIFIER"].ToString(),
                  PXLast = reader["PX_LAST"] != DBNull.Value ? Convert.ToDouble(reader["PX_LAST"]) : (double?)null,
                  LastTradeableDt = reader["LAST_TRADEABLE_DT"] != DBNull.Value ? (DateTime)reader["LAST_TRADEABLE_DT"] : (DateTime?)null,
                });
              }
            }
          }
        }

        return Ok(bloombergRecords);
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in GetRecords: {ex.Message}");
        return StatusCode(500, new { error = ex.Message });
      }
    }

    [HttpGet("getToken")]
    public async Task<IActionResult> GetBloombergToken()
    {
      try
      {
        // Check if the token is still valid
        if (_cache.TryGetValue(TokenCacheKey, out string cachedToken) &&
            _cache.TryGetValue(TokenExpiryCacheKey, out DateTime expiryTime) &&
            DateTime.UtcNow < expiryTime)
        {
          Console.WriteLine("Returning cached Bloomberg token.");
          return Ok(new { access_token = cachedToken });
        }

        Console.WriteLine("Bloomberg token expired. Fetching new one...");

        // Fetch new token
        var requestData = new Dictionary<string, string>
        {
            { "grant_type", "client_credentials" },
            { "client_id", ClientId },
            { "client_secret", ClientSecret }
        };

        var requestContent = new FormUrlEncodedContent(requestData);
        HttpResponseMessage response = await _httpClient.PostAsync(TokenUrl, requestContent);

        if (!response.IsSuccessStatusCode)
        {
          return StatusCode((int)response.StatusCode, $"Error fetching Bloomberg token: {await response.Content.ReadAsStringAsync()}");
        }

        string responseContent = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonSerializer.Deserialize<BloombergTokenResponse>(responseContent);

        if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.access_token))
        {
          return StatusCode(500, "Bloomberg token response invalid.");
        }

        // Store token in cache with expiration time
        _cache.Set(TokenCacheKey, tokenResponse.access_token, TimeSpan.FromSeconds(tokenResponse.expires_in - 10));
        _cache.Set(TokenExpiryCacheKey, DateTime.UtcNow.AddSeconds(tokenResponse.expires_in - 10));

        Console.WriteLine("New Bloomberg token obtained and cached.");

        return Ok(new { access_token = tokenResponse.access_token });
      }
      catch (HttpRequestException httpEx)
      {
        string innerExceptionMessage = httpEx.InnerException != null ? httpEx.InnerException.Message : "No inner exception";

        return StatusCode(500, new
        {
          error = "HTTP Request Exception",
          exceptionMessage = httpEx.Message,
          innerException = innerExceptionMessage
        });
      }
      catch (Exception ex)
      {
        string innerExceptionMessage = ex.InnerException != null ? ex.InnerException.Message : "No inner exception";

        return StatusCode(500, new
        {
          error = "General Exception",
          exceptionMessage = ex.Message,
          innerException = innerExceptionMessage
        });
      }
    }



    [HttpGet("getCsv/{requestIdentifier}/{snapshotDate}")]
    public async Task<IActionResult> GetCsvFromBloomberg(string requestIdentifier, string snapshotDate)
    {
      try
      {
        // ✅ Step 1: Get Bloomberg Token
        string token = await GetValidToken();
        if (string.IsNullOrEmpty(token))
        {
          return Unauthorized("Could not get Bloomberg API token.");
        }

        // ✅ Step 2: Construct Bloomberg API URL
        string url = $"https://api.bloomberg.com/eap/catalogs/39321/datasets/{requestIdentifier}/snapshots/{snapshotDate}/distributions/{requestIdentifier}.csv";

        using (var httpClient = new HttpClient())
        {
          httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
          httpClient.DefaultRequestHeaders.Add("api-version", "2");

          HttpResponseMessage response = await httpClient.GetAsync(url);

          if (!response.IsSuccessStatusCode)
          {
            string errorMessage = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, $"Bloomberg API Error: {errorMessage}");
          }

          // ✅ Step 3: Read the CSV content
          byte[] fileBytes = await response.Content.ReadAsByteArrayAsync();

          // ✅ Step 4: Return CSV file as response
          return File(fileBytes, "text/csv", $"{requestIdentifier}_{snapshotDate}.csv");
        }
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { error = "Error retrieving CSV from Bloomberg.", message = ex.Message });
      }
    }



    private async Task<string> GetValidToken()
    {
      if (_cache.TryGetValue(TokenCacheKey, out string cachedToken) &&
          _cache.TryGetValue(TokenExpiryCacheKey, out DateTime expiryTime) &&
          DateTime.UtcNow < expiryTime)
      {
        return cachedToken;  // ✅ Return cached token if still valid
      }

      // ✅ Step 1: Request a new token from Bloomberg
      var requestData = new Dictionary<string, string>
    {
        { "grant_type", "client_credentials" },
        { "client_id", ClientId },
        { "client_secret", ClientSecret }
    };

      var requestContent = new FormUrlEncodedContent(requestData);
      HttpResponseMessage response = await _httpClient.PostAsync(TokenUrl, requestContent);

      if (!response.IsSuccessStatusCode)
      {
        return null;  // ❌ Token request failed
      }

      string responseContent = await response.Content.ReadAsStringAsync();
      var tokenResponse = JsonSerializer.Deserialize<BloombergTokenResponse>(responseContent);

      if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.access_token))
      {
        return null;
      }

      // ✅ Step 2: Cache the token for reuse
      _cache.Set(TokenCacheKey, tokenResponse.access_token, TimeSpan.FromSeconds(tokenResponse.expires_in - 10));
      _cache.Set(TokenExpiryCacheKey, DateTime.UtcNow.AddSeconds(tokenResponse.expires_in - 10));

      return tokenResponse.access_token;
    }







    private class BloombergTokenResponse
    {
      public string access_token { get; set; }
      public int expires_in { get; set; } // Expiration time in seconds
    }
  }




}
