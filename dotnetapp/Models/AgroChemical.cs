using System.ComponentModel.DataAnnotations;

namespace dotnetapp.Models
{
    public class AgroChemical
    {
        [Key]
        public int AgroChemicalId { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "Brand cannot exceed 100 characters.")]
        public string? Brand { get; set; }

        [Required(ErrorMessage = "Category is required.")]
        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters.")]
        public string Category { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Unit is required.")]
        [StringLength(20, ErrorMessage = "Unit cannot exceed 20 characters.")]
        public string Unit { get; set; } = string.Empty;

        [Range(0, 1_000_000, ErrorMessage = "Price per unit must be a less than 1000000 or non negative")]
        [DataType(DataType.Currency)]
        public decimal PricePerUnit { get; set; }
      
        public string Image { get; set; }
    }
}
