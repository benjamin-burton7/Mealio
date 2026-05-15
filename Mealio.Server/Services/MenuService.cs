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

	private readonly string _menuPath = config["MenuSettings:EdisonMenuPath"]
		?? "output/menu_edison.json";

	public async Task<EdisonMenuDto?> GetEdisonMenuAsync()
	{
		if (!File.Exists(_menuPath))
		{
			logger.LogWarning("Edison menu file not found at {Path}", _menuPath);
			return null;
		}

		try
		{
			var json = await File.ReadAllTextAsync(_menuPath, Encoding.UTF8);
			return JsonSerializer.Deserialize<EdisonMenuDto>(json, JsonOptions);
		}
		catch (Exception ex)
		{
			logger.LogError(ex, "Failed to deserialize Edison menu from {Path}", _menuPath);
			return null;
		}
	}
}