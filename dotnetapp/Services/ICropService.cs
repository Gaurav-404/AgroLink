using System.Collections.Generic;
using System.Threading.Tasks;
using dotnetapp.Models;

namespace dotnetapp.Services
{
    public interface ICropService
    {
        Task<Crop> GetCropById(int cropId);
        Task<IEnumerable<Crop>> GetCropsByUserId(int userId);
        Task<bool> AddCrop(Crop crop);
        Task<bool> UpdateCrop(int cropId, Crop crop);
        Task<bool> DeleteCrop(int cropId);
        Task<IEnumerable<Crop>> GetAllCrops();
    }
}