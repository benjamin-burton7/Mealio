public class Restaurant
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string OpeningHours { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;

    public List<MenuItem> MenuItems { get; set; } = new();
}