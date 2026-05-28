using Mealio.Server.Dtos;

namespace Mealio.Server.Contracts;

public interface IMenuService
{
    Task<MenuDto?> GetMenuAsync(string restaurantId);
}