using Mealio.Server.Contracts;
using Mealio.Server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IMenuService, MenuService>();
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();