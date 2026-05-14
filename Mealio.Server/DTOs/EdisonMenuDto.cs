namespace Mealio.Server.DTOs
{
    // EdisonMenuDto.cs
    public class EdisonMenuDto
    {
        public string Week { get; set; }
        public Dictionary<string, List<DishDto>> Days { get; set; }
    }

    public class DishDto
    {
        public string Category { get; set; }
        public string Price { get; set; }
        public string Dish { get; set; }
    }
}