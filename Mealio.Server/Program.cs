using Mealio.Server.Contracts;
using Mealio.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddScoped<IMenuService, MenuService>();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.MapControllers();
app.MapGet("/api/menu/bricks", async (IMenuService menuService) =>
{
    var menu = await menuService.GetBricksMenuAsync();

    if (menu is null)
    {
        return Results.NotFound("Bricks menu was not found.");
    }

    return Results.Ok(menu);
});
app.MapFallbackToFile("/index.html");

app.Run("http://0.0.0.0:5000");
