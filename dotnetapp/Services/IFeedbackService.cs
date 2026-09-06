using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using dotnetapp.Models;
using Microsoft.AspNetCore.Mvc;
namespace dotnetapp.Services
{
    public interface IFeedbackService
    {
        
        Task<IEnumerable<Feedback>> GetAllFeedbacks();
        Task<IEnumerable<Feedback>> GetFeedbacksByUserId(int userId);
        Task<bool> AddFeedback(Feedback obj);
        Task<bool> DeleteFeedback(int id);
         Task<User>GetUserById(int id);
         Task<List<User>>GetUsers();
    }
}