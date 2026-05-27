using System.Text;
using Mealio.Server.Dtos;
using Mealio.Server.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Abstractions;

namespace Mealio.Tests;

public class MenuServiceTests
{
    [Fact]
    public async Task GetEdisonMenuAsync_ReturnsNull_WhenFileDoesNotExist()
    {
        var tempDirectory = CreateTempDirectory();
        var missingFileName = $"{Guid.NewGuid()}.json";

        var service = CreateService(tempDirectory, missingFileName);

        try
        {
            var result = await service.GetEdisonMenuAsync();

            Assert.Null(result);
        }
        finally
        {
            Directory.Delete(tempDirectory, recursive: true);
        }
    }

    [Fact]
    public async Task GetEdisonMenuAsync_ReturnsNull_WhenJsonIsInvalid()
    {
        var tempDirectory = CreateTempDirectory();
        var fileName = "menu_edison.json";
        var filePath = Path.Combine(tempDirectory, fileName);

        await File.WriteAllTextAsync(filePath, "{ invalid json", Encoding.UTF8);

        var service = CreateService(tempDirectory, fileName);

        try
        {
            var result = await service.GetEdisonMenuAsync();

            Assert.Null(result);
        }
        finally
        {
            Directory.Delete(tempDirectory, recursive: true);
        }
    }

    [Fact]
    public async Task GetEdisonMenuAsync_ReturnsMenu_WhenJsonIsValid()
    {
        var tempDirectory = CreateTempDirectory();
        var fileName = "menu_edison.json";
        var filePath = Path.Combine(tempDirectory, fileName);

        var json = """
        {
          "week": "Vecka 22",
          "days": {
            "Måndag": [
              {
                "category": "Green",
                "price": "115:-",
                "dish": "Pasta med citronsås"
              }
            ]
          }
        }
        """;

        await File.WriteAllTextAsync(filePath, json, Encoding.UTF8);

        var service = CreateService(tempDirectory, fileName);

        try
        {
            MenuDto? result = await service.GetEdisonMenuAsync();

            Assert.NotNull(result);
            Assert.Equal("Vecka 22", result.Week);
            Assert.True(result.Days.ContainsKey("Måndag"));
            Assert.Single(result.Days["Måndag"]);
            Assert.Equal("Green", result.Days["Måndag"][0].Category);
            Assert.Equal("115:-", result.Days["Måndag"][0].Price);
            Assert.Equal("Pasta med citronsås", result.Days["Måndag"][0].Dish);
        }
        finally
        {
            Directory.Delete(tempDirectory, recursive: true);
        }
    }

    [Fact]
    public async Task GetNordrestMenuAsync_ReturnsMenu_WhenJsonIsValid()
    {
        var tempDirectory = CreateTempDirectory();
        var fileName = "menu_nordrest.json";
        var filePath = Path.Combine(tempDirectory, fileName);

        var json = """
        {
          "week": "V22",
          "days": {
            "Fredag": [
              {
                "category": "Lunch",
                "price": "105:-",
                "dish": "Fish cakes"
              }
            ]
          }
        }
        """;

        await File.WriteAllTextAsync(filePath, json, Encoding.UTF8);

        var service = CreateService(
            tempDirectory,
            edisonMenuPath: "unused_edison.json",
            nordrestMenuPath: fileName);

        try
        {
            MenuDto? result = await service.GetNordrestMenuAsync();

            Assert.NotNull(result);
            Assert.Equal("V22", result.Week);
            Assert.True(result.Days.ContainsKey("Fredag"));
            Assert.Single(result.Days["Fredag"]);
            Assert.Equal("Lunch", result.Days["Fredag"][0].Category);
            Assert.Equal("105:-", result.Days["Fredag"][0].Price);
            Assert.Equal("Fish cakes", result.Days["Fredag"][0].Dish);
        }
        finally
        {
            Directory.Delete(tempDirectory, recursive: true);
        }
    }

    private static MenuService CreateService(
        string contentRootPath,
        string edisonMenuPath,
        string? nordrestMenuPath = null)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["MenuSettings:EdisonMenuPath"] = edisonMenuPath,
                ["MenuSettings:NordrestMenuPath"] = nordrestMenuPath ?? edisonMenuPath
            })
            .Build();

        var environment = new FakeWebHostEnvironment
        {
            ContentRootPath = contentRootPath
        };

        return new MenuService(
            config,
            environment,
            NullLogger<MenuService>.Instance);
    }

    private static string CreateTempDirectory()
    {
        var path = Path.Combine(Path.GetTempPath(), $"mealio-tests-{Guid.NewGuid()}");
        Directory.CreateDirectory(path);
        return path;
    }

    private sealed class FakeWebHostEnvironment : IWebHostEnvironment
    {
        public string ApplicationName { get; set; } = "Mealio.Tests";
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = string.Empty;
        public string EnvironmentName { get; set; } = "Development";
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string WebRootPath { get; set; } = string.Empty;
    }
}