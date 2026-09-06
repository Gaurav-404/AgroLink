using System.Collections.Generic;
using System.Threading.Tasks;
using dotnetapp.Models;

namespace dotnetapp.Services
{
    public interface IAgroChemicalService
    {
        Task<IEnumerable<AgroChemical>> GetAllAgroChemicals();
        Task<AgroChemical> GetAgroChemicalByld(int agroChemicalId); // keep exact name as used in controller
        Task<bool> AddAgroChemical(AgroChemical agroChemical);
        Task<bool> UpdateAgroChemical(int agroChemicalId, AgroChemical agroChemical);
        Task<bool> DeleteAgroChemical(int agroChemicalId);
    }
}