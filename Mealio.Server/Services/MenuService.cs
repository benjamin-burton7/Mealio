using System.Text;
using System.Text.Json;
using Mealio.Server.Contracts;
using Mealio.Server.DTOs;

namespace Mealio.Server.Services;

public class MenuService(IConfiguration config, ILogger<MenuService> logger) : IMenuService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly string _edisonMenuPath = config["MenuSettings:EdisonMenuPath"]
        ?? "Data/Menus/menu_edison.json";

    private readonly string _bricksMenuPath = config["MenuSettings:BricksMenuPath"]
        ?? "Data/Menus/menu_bricks.json";

    public Task<MenuDto?> GetEdisonMenuAsync()
    {
        return ReadMenuAsync(_edisonMenuPath, "Edison");
    }

    public Task<MenuDto?> GetBricksMenuAsync()
    {
        return ReadMenuAsync(_bricksMenuPath, "Bricks");
    }

    private async Task<MenuDto?> ReadMenuAsync(string path, string restaurantName)
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