using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using dotnetapp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using dotnetapp.Models;
using dotnetapp.Data;

namespace dotnetapp.Controllers
{
    [ApiController]
    [Route("api/crops")]
    public class CropController : ControllerBase
    {
        public ICropService ser;
        public ApplicationDbContext db;
        public CropController(ICropService ser1, ApplicationDbContext db1) { ser = ser1; db = db1; }
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Crop>>> GetCropsByUserId(int userId)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid request");
            var crops = await ser.GetCropsByUserId(userId);
            if (crops == null) return NotFound("No crops found for this user.");
            return Ok(crops);
        }
        [HttpGet("{cropId}")]
        public async Task<ActionResult<Crop>> GetCropById(int cropId)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid request");
            var crop = await ser.GetCropById(cropId);
            if (crop == null) return NotFound("Cannot find any crop.");
            return Ok(crop);
        }
        [HttpPost]
        public async Task<ActionResult> AddCrop([FromBody] Crop crop)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid request");
            try
            {
                if (await ser.AddCrop(crop)) return Ok("Crop added successfully");
                else return StatusCode(500, "Failed to add crop.");
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
        [HttpPut("{cropId}")]
        public async Task<ActionResult> UpdateCrop(int cropId, [FromBody] Crop crop)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid request");
            try
            {
                if (db.Crops.Find(cropId) == null) return NotFound("Cannot find any crop.");
                if (await ser.UpdateCrop(cropId, crop)) return Ok("Crop updated successfully");
                else return StatusCode(500, "Failed to add crop.");
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
        [HttpDelete("{cropId}")]
        public async Task<ActionResult> DeleteCrop(int cropId)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid request");
            try
            {
                if (db.Crops.Find(cropId) == null) return NotFound("Cannot find any crop.");
                if (await ser.DeleteCrop(cropId)) return Ok("Crop deleted successfully");
                else return StatusCode(500, "Failed to add crop.");
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Crop>>> GetAllCrops()
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid request");
            var crops = await ser.GetAllCrops();
            if (crops == null) return NotFound("No crops found.");
            return Ok(crops);
        }
    }
}