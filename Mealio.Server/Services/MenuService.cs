using System.Text;
using System.Text.Json;
using Mealio.Server.Contracts;
using Mealio.Server.Dtos;

namespace Mealio.Server.Services;

public class MenuService(
    IConfiguration config,
    IWebHostEnvironment environment,
    ILogger<MenuService> logger) : IMenuService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly Dictionary<string, string> _menuPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        ["edison"] = config["MenuSettings:EdisonMenuPath"] ?? "Data/Menus/menu_edison.json",
        ["nordrest"] = config["MenuSettings:NordrestMenuPath"] ?? "Data/Menus/menu_nordrest.json",
        ["bryggan"] = config["MenuSettings:BrygganMenuPath"] ?? "Data/Menus/menu_bryggan.json",
        ["laziza"] = config["MenuSettings:LazizaMenuPath"] ?? "Data/Menus/menu_laziza.json",
        ["smaka-pa-kina"] = config["MenuSettings:SmakaPaKinaMenuPath"] ?? "Data/Menus/menu_smaka_pa_kina.json",
        ["inspira"] = config["MenuSettings:InspiraMenuPath"] ?? "Data/Menus/menu_inspira.json",
        ["salads-and-smoothies"] = config["MenuSettings:SaladsAndSmoothiesMenuPath"] ?? "Data/Menus/menu_salads_and_smoothies.json",
        ["bricks-eatery"] = config["MenuSettings:BricksEateryMenuPath"] ?? "Data/Menus/menu_bricks_eatery.json",
    };
        
    public async Task<MenuDto?> GetMenuAsync(string restaurantId)
    {
        if (!_menuPaths.TryGetValue(restaurantId, out var relativePath))
        {
            logger.LogWarning("Unknown restaurant id: {RestaurantId}", restaurantId);
            return null;
        }

        var menuPath = Path.Combine(environment.ContentRootPath, relativePath);

        if (!File.Exists(menuPath))
        {
            logger.LogWarning("Menu file for {RestaurantId} was not found at {Path}", restaurantId, menuPath);
            return null;
        }

        try
        {
            var json = await File.ReadAllTextAsync(menuPath, Encoding.UTF8);
            return JsonSerializer.Deserialize<MenuDto>(json, JsonOptions);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to deserialize menu for {RestaurantId} from {Path}", restaurantId, menuPath);
            return null;
        }
    }
}