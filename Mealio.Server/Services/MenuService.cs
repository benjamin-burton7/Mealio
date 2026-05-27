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

    private readonly string _edisonMenuPath = Path.Combine(
        environment.ContentRootPath,
        config["MenuSettings:EdisonMenuPath"] ?? "Data/Menus/menu_edison.json");

    private readonly string _nordrestMenuPath = Path.Combine(
        environment.ContentRootPath,
        config["MenuSettings:NordrestMenuPath"] ?? "Data/Menus/menu_nordrest.json");

    public Task<MenuDto?> GetEdisonMenuAsync()
    {
        return GetMenuFromFileAsync(_edisonMenuPath, "Edison");
    }

    public Task<MenuDto?> GetNordrestMenuAsync()
    {
        return GetMenuFromFileAsync(_nordrestMenuPath, "Nordrest");
    }

    private async Task<MenuDto?> GetMenuFromFileAsync(string menuPath, string restaurantName)
    {
        if (!File.Exists(menuPath))
        {
            logger.LogWarning("{Restaurant} menu file not found at {Path}", restaurantName, menuPath);
            return null;
        }

        try
        {
            var json = await File.ReadAllTextAsync(menuPath, Encoding.UTF8);
            return JsonSerializer.Deserialize<MenuDto>(json, JsonOptions);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to deserialize {Restaurant} menu from {Path}", restaurantName, menuPath);
            return null;
        }
    }
}