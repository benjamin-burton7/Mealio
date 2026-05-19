using Mealio.Server.DTOs;

namespace Mealio.Server.Contracts;

public interface IMenuService
{
    Task<MenuDto?> GetEdisonMenuAsync();
    Task<MenuDto?> GetBricksMenuAsync();
}