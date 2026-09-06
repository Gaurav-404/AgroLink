using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
namespace dotnetapp.Models
{
    public class LoginModel
    {
        [EmailAddress]
        [Required]
        public string Email{get;set;}
        [Required]
        public string Password{get;set;}
    }
}