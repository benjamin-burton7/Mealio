using Mealio.Server.Dtos;

namespace Mealio.Server.Contracts;

public interface IMenuService
{
    Task<EdisonMenuDto?> GetEdisonMenuAsync();
}