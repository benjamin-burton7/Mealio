public class Allergen
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<MenuItem> MenuItems { get; set; } = new();
}