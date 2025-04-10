using Coberturas.Contexts;
using Coberturas.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// ✅ 1. Fix CORS Configuration (Only Allow One Origin)
builder.Services.AddCors(options =>
{
  options.AddPolicy("MyCorsPolicy", policy =>
  {
    policy
        .WithOrigins("http://localhost:4200", "http://10.128.47.70/CoberturasApp/")  // ✅ Only allow defined origins
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
  });
});

var connectionString = builder.Configuration.GetConnectionString("ConnectionWrong");
builder.Services.AddDbContext<ConnectionSQL>(x => x.UseSqlServer(connectionString));

builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();


builder.Services.AddScoped<IAutorizacionService, AutorizacionService>();
var key = builder.Configuration.GetValue<string>("JWT:Key");
var keyBytes = Encoding.ASCII.GetBytes(key);

builder.Services.AddAuthentication(config =>
{
  config.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
  config.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(config =>
{
  config.RequireHttpsMetadata = false;
  config.SaveToken = true;
  config.TokenValidationParameters = new TokenValidationParameters
  {
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
    ValidateIssuer = false,
    ValidateAudience = false,
    ValidateLifetime = true,
    ClockSkew = TimeSpan.Zero
  };
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ✅ 2. Ensure CORS is Applied BEFORE Authentication and Controllers
app.UseCors("MyCorsPolicy");

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseSwagger();
app.UseSwaggerUI();

app.Run();
