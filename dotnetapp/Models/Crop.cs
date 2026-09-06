using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
namespace dotnetapp.Models
{
    public class Crop
    {
        [Key]
        public int CropId { get; set; }
        [Required]
        [MinLength(2)]
        [MaxLength(50)]

        public string CropName { get; set; }
        [Required]
        public string CropType { get; set; }
        [Required]
        [MinLength(4)]
        [MaxLength(500)]
        public string Description { get; set; }
        [Required]
        public DateTime PlantingDate { get; set; }
        
        public int? UserId { get; set; }
        [JsonIgnore]
        public User? User { get; set; }
    }
}