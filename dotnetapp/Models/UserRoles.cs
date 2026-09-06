using System;

using System.Collections.Generic;

using System.Linq;

using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
 
namespace dotnetapp.Models

{

    public class UserRoles

    {
        [Required]
       public string Farmer{get; set;}
       [Required]
       public string Seller{get; set;}
    }
}
 
