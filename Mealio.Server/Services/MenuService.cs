using System.Text;
using System.Text.Json;
using Mealio.Server.Contracts;
using Mealio.Server.Dtos;

namespace Mealio.Server.Services;

public class MenuService(
    IConfiguration config,
    ILogger<MenuService> logger,
    IWebHostEnvironment environment) : IMenuService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly string _edisonMenuPath = Path.Combine(
        environment.ContentRootPath,
        config["MenuSettings:EdisonMenuPath"] ?? "Data/Menus/menu_edison.json"
    );

    private readonly string _bricksMenuPath = Path.Combine(
        environment.ContentRootPath,
        config["MenuSettings:BricksMenuPath"] ?? "Data/Menus/menu_bricks.json"
    );

    public Task<MenuDto?> GetEdisonMenuAsync()
    {
        return GetMenuAsync(_edisonMenuPath, "Edison");
    }

    public Task<MenuDto?> GetBricksMenuAsync()
    {
        return GetMenuAsync(_bricksMenuPath, "Bricks");
    }

    private async Task<MenuDto?> GetMenuAsync(string path, string restaurantName)
    {
        if (!File.Exists(path))
        {
            logger.LogWarning("{RestaurantName} menu file not found at {Path}", restaurantName, path);
            return null;
        }

        try
        {
            var json = await File.ReadAllTextAsync(path, Encoding.UTF8);
            return JsonSerializer.Deserialize<MenuDto>(json, JsonOptions);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to deserialize {RestaurantName} menu from {Path}", restaurantName, path);
            return null;
        }
    }
}