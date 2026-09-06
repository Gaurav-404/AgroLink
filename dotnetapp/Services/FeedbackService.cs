using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dotnetapp.Data;
using dotnetapp.Models;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Services
{
    public class FeedbackService:IFeedbackService
    {

        private readonly ApplicationDbContext _context;

        public FeedbackService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Feedback>> GetAllFeedbacks()
        {
            return await _context.Feedbacks.ToListAsync();

        }
        public async Task<IEnumerable<Feedback>> GetFeedbacksByUserId(int userId)
        {
            var res = await _context.Feedbacks.Where(f => f.UserId == userId).ToListAsync();
            return res;
        }

        public async Task<bool> AddFeedback(Feedback obj)
        {
            await _context.Feedbacks.AddAsync(obj);
            var res = await _context.SaveChangesAsync();
            return res > 0;
        }

        public async Task<bool> DeleteFeedback(int id)
        {
            var data = await _context.Feedbacks.FindAsync(id);
            if (data == null)
            {
                return false;
            }
            _context.Feedbacks.Remove(data);
            var result = await _context.SaveChangesAsync();

            return result > 0;
        }

        public async Task<User>GetUserById(int id){
            var user = await _context.Users.FindAsync(id);
            if(user==null){
                return null;
            }
            else{
                return user;
            }
        }
        public async Task<List<User>>GetUsers(){
            return  await _context.Users.ToListAsync();
           
        }



    }
}