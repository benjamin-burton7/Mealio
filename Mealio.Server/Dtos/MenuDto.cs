using System.Text.Json.Serialization;

namespace Mealio.Server.Dtos;

public class MenuDto
{
    [JsonPropertyName("week")]
    public string Week { get; set; } = string.Empty;

    [JsonPropertyName("days")]
    public Dictionary<string, List<DishDto>> Days { get; set; } = [];
}

public class DishDto
{
    [JsonPropertyName("category")]
    public string Category { get; set; } = string.Empty;

    [JsonPropertyName("price")]
    public string Price { get; set; } = string.Empty;

    [JsonPropertyName("dish")]
    public string Dish { get; set; } = string.Empty;
}