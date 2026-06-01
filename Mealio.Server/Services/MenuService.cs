using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mealio.Server.Contracts;
using Mealio.Server.Dtos;

namespace Mealio.Server.Services;

public class MenuService(
    IWebHostEnvironment environment,
    ILogger<MenuService> logger) : IMenuService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private static readonly Regex ValidRestaurantIdPattern = new(
        "^[a-z0-9-]+$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private record CachedMenu(MenuDto Menu, DateTimeOffset ExpiresAt);

    private readonly ConcurrentDictionary<string, CachedMenu> _cache = new();

    private static string GetRelativePath(string restaurantId)
    {
        var fileNameRestaurantId = restaurantId.Replace('-', '_');

        return $"Data/Menus/menu_{fileNameRestaurantId}.json";
    }

    public async Task<MenuDto?> GetMenuAsync(string restaurantId)
    {
        if (!ValidRestaurantIdPattern.IsMatch(restaurantId))
        {
            logger.LogWarning(
                "Invalid restaurant id requested: {RestaurantId}",
                restaurantId);

            return null;
        }

        if (
            _cache.TryGetValue(restaurantId, out var cached)
            && cached.ExpiresAt > DateTimeOffset.Now
        )
        {
            return cached.Menu;
        }

        var relativePath = GetRelativePath(restaurantId);
        var menuPath = Path.Combine(environment.ContentRootPath, relativePath);

        if (!File.Exists(menuPath))
        {
            logger.LogWarning(
                "Menu file for {RestaurantId} was not found at {Path}",
                restaurantId,
                menuPath);

            return null;
        }

        try
        {
            var json = await File.ReadAllTextAsync(menuPath, Encoding.UTF8);
            var menu = JsonSerializer.Deserialize<MenuDto>(json, JsonOptions);

            if (menu is null)
            {
                logger.LogWarning(
                    "Menu for {RestaurantId} deserialized to null",
                    restaurantId);

                return null;
            }

            var nextCacheExpiry = DateTime.Today.AddHours(8);

            if (DateTime.Now >= nextCacheExpiry)
            {
                nextCacheExpiry = nextCacheExpiry.AddDays(1);
            }

            _cache[restaurantId] = new CachedMenu(
                menu,
                new DateTimeOffset(nextCacheExpiry));

            return menu;
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to deserialize menu for {RestaurantId} from {Path}",
                restaurantId,
                menuPath);

            return null;
        }
    }
}