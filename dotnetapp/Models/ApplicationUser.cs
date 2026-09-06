using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace dotnetapp.Models
{
    public class ApplicationUser
    {
        [MaxLength(30)]
        [Required]
        public string Name{get;set;}
    }
}