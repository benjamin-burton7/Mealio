using Mealio.Server.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace Mealio.Server;

[ApiController]
[Route("api/[controller]")]
public class MenuController(IMenuService menuService) : ControllerBase
{
    [HttpGet("{restaurantId}")]
    public async Task<IActionResult> GetMenu(string restaurantId)
    {
        var menu = await menuService.GetMenuAsync(restaurantId);

        if (menu is null)
            return NotFound();

        return Ok(menu);
    }
}