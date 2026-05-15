using Mealio.Server.DTOs;

namespace Mealio.Server.Contracts;

public interface IMenuService
{
    Task<EdisonMenuDto?> GetEdisonMenuAsync();
}