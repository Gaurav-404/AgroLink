using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;
namespace dotnetapp.Models
{
    public class Request
    {
        [Key]
        public int RequestId{get;set;}
        public int? AgroChemicalId{get;set;}
        

        [JsonIgnore]
        public AgroChemical? AgroChemical{get;set;}
        public int? UserId{get;set;}
        [JsonIgnore]
        public User? User{get;set;}
        public int? CropId{get;set;}
        [JsonIgnore]
        public Crop? Crop{get;set;}
        [Required]        
        public int Quantity{get;set;}
        [Required]
        [MinLength(5)]
        [MaxLength(50)]
        public string Status{get;set;}
        [Required]
        public DateTime RequestDate{get;set;}

    }
}