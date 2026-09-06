using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Threading.Tasks;
using dotnetapp.Data;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services
{
    public class CropService : ICropService
    {
        public ApplicationDbContext db;
        public CropService(ApplicationDbContext db1){ db=db1; }

        public async Task<Crop> GetCropById(int cropId)
        {
            // a. Retrieves a crop from the database with the specified cropld.
            var res = db.Crops.Find(cropId);
            return res;
            
        }

        public async Task<IEnumerable<Crop>> GetCropsByUserId(int userId)
        {
            // a. Retrieves and returns all crops associated with the specified userld from the database.
            var res = db.Crops.Where(c=>c.UserId==userId);

            return res;
        }

        public async Task<bool> AddCrop(Crop crop)
        {
            // a. Adds a new crop to the database.
            db.Crops.Add(crop);
            // b. Saves changes asynchronously to the database.
            await db.SaveChangesAsync();
            // c. Returns true for the successful insertion.
            return true;
        }

        public async Task<bool> UpdateCrop(int cropId, Crop crop)
        {
            // a. Retrieves an existing crop from the database based on the provided cropld.
            var res = db.Crops.Find(cropId);
            // b. If no crop with the specified ID is found, returns false.
            if(res == null) return false;
            // c. Updates the existing crop with the values from the provided crop object.
            res.CropName = crop.CropName;
            res.CropType = crop.CropType;
            res.Description = crop.Description;
            res.PlantingDate = crop.PlantingDate;
            res.UserId = crop.UserId;
            // d. Saves changes asynchronously to the database.
            await db.SaveChangesAsync();
            // e. Returns true for the successful update.
            return true;
        }

        public async Task<bool> DeleteCrop(int cropId)
        {
            // a. Retrieves the crop from the database based on the provided cropld.
            var res = db.Crops.Find(cropId);
            // b. If no crop with the specified ID is found, returns false.
            if(res == null) return false;
            // c. Removes the crop from the database.
            db.Crops.Remove(res);
            // d. Saves changes asynchronously to the database.
            await db.SaveChangesAsync();
            // e. Returns true for the successful deletion.
            return true;
        }
        public async Task<IEnumerable<Crop>> GetAllCrops()
        {
            var res = db.Crops.Include(c=>c.User);
            return res;
        }
    }
}