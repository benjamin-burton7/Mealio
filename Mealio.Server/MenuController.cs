using Mealio.Server.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace Mealio.Server;

[ApiController]
[Route("api/[controller]")]
public class MenuController(IMenuService menuService) : ControllerBase
{
    [HttpGet("edison")]
    public async Task<IActionResult> GetEdisonMenu()
    {
        var menu = await menuService.GetEdisonMenuAsync();

        if (menu is null)
        {
            return NotFound("Edison menu was not found.");
        }

        return Ok(menu);
    }
}