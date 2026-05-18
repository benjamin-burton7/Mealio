using System.Text;
using Mealio.Server.Dtos;
using Mealio.Server.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace Mealio.Tests;

public class MenuServiceTests
{
    [Fact]
    public async Task GetEdisonMenuAsync_ReturnsNull_WhenFileDoesNotExist()
    {
        var missingPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.json");

        var service = CreateService(missingPath);

        var result = await service.GetEdisonMenuAsync();

        Assert.Null(result);
    }

    [Fact]
    public async Task GetEdisonMenuAsync_ReturnsNull_WhenJsonIsInvalid()
    {
        var tempFile = Path.GetTempFileName();
        await File.WriteAllTextAsync(tempFile, "{ invalid json", Encoding.UTF8);

        var service = CreateService(tempFile);

        try
        {
            var result = await service.GetEdisonMenuAsync();

            Assert.Null(result);
        }
        finally
        {
            File.Delete(tempFile);
        }
    }

    [Fact]
    public async Task GetEdisonMenuAsync_ReturnsMenu_WhenJsonIsValid()
    {
        var tempFile = Path.GetTempFileName();

        var json = """
        {
        }
        """;

        await File.WriteAllTextAsync(tempFile, json, Encoding.UTF8);

        var service = CreateService(tempFile);

        try
        {
            EdisonMenuDto? result = await service.GetEdisonMenuAsync();

            Assert.NotNull(result);
        }
        finally
        {
            File.Delete(tempFile);
        }
    }

    private static MenuService CreateService(string menuPath)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["MenuSettings:EdisonMenuPath"] = menuPath
            })
            .Build();

        return new MenuService(
            config,
            NullLogger<MenuService>.Instance);
    }
}