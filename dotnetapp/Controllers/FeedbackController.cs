using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using dotnetapp.Data;
using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {

        private readonly IFeedbackService ser;

        public FeedbackController(IFeedbackService context)
        {
            ser = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Feedback>>> GetAllFeedbacks()
        {
            try
            {
                var res = await ser.GetAllFeedbacks();
                return Ok(res);
            }
            catch
            {
                return StatusCode(500, "Internal Server Error");

            }
        }
        [HttpGet("user{id}")]
        public async Task<ActionResult<IEnumerable<Feedback>>> GetFeedbacksByUserId(int id)
        {
            try
            {
                var res = await ser.GetFeedbacksByUserId(id);
                if (res == null)
                {
                    return StatusCode(404, "No Feedback Found");
                }
                else
                {
                    return Ok(res);
                }
            }
            catch
            {
                return StatusCode(500, "Internal Server Error");

            }
        }
        [HttpPost]

        public async Task<ActionResult> AddFeedback(Feedback feedback)
        {
            try
            {
                var ok = await ser.AddFeedback(feedback);
                if (!ok) return StatusCode(400, "Failed to add feedback.");
                return StatusCode(200,"Feedback added Successfully");
            }
            catch
            {
                return StatusCode(500, "Internal Server Error");
            }
        }
        [HttpDelete]
        public async Task<ActionResult> DeleteFeedback(int id)
        {
            var res = await ser.DeleteFeedback(id);
            try
            {
                if (!res)
                {
                    return StatusCode(404, "Cannot find any feedback");
                }
                return StatusCode(200, "Feedback deleted successfully");
            }
            catch
            {
                return StatusCode(500, "Internal Server Error");
            }
        }


        [HttpGet("User/{id}")]

        public async Task<User>GetUserById(int id){

            return await ser.GetUserById(id);
        }

        [HttpGet("User")]

        public async Task<List<User>>GetUsers(){
            return await ser.GetUsers();
        }





    }
}