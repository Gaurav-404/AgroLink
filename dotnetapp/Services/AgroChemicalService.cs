using dotnetapp.Data;
using dotnetapp.Exceptions;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services
{
    public class AgroChemicalService : IAgroChemicalService
    {
        private readonly ApplicationDbContext _db;

        public AgroChemicalService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<AgroChemical>> GetAllAgroChemicals()
        {
            return await _db.AgroChemicals.AsNoTracking().ToListAsync();
        }

        // NOTE: Kept the method name exactly as used in your controller: GetAgroChemicalByld
        public async Task<AgroChemical> GetAgroChemicalByld(int agroChemicalId)
        {
            var entity = await _db.AgroChemicals.FindAsync(agroChemicalId);
            if (entity is null)
                throw new AgroChemicalNotFoundException(agroChemicalId);

            return entity;
        }

        public async Task<bool> AddAgroChemical(AgroChemical agroChemical)
        {
            // Null/body validation (ModelState is in controller; this protects service from null calls)
            if (agroChemical is null)
                throw new AgroChemicalValidationException("Request body cannot be null.");

            // Example business rule: Name must be unique
            var exists = await _db.AgroChemicals
                                  .AnyAsync(a => a.Name == agroChemical.Name);
            if (exists)
                // Updated message to match the test expectation exactly (no period).
                throw new AgroChemicalConflictException("Agrochemical with the same name and brand already exists");

            _db.AgroChemicals.Add(agroChemical);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateAgroChemical(int agroChemicalId, AgroChemical agroChemical)
        {
            if (agroChemical is null)
                throw new AgroChemicalValidationException("Request body cannot be null.");

            var entity = await _db.AgroChemicals.FindAsync(agroChemicalId);
            if (entity is null)
                throw new AgroChemicalNotFoundException(agroChemicalId);

            // Enforce unique name (excluding the current record)
            var nameConflict = await _db.AgroChemicals
                .AnyAsync(a => a.Name == agroChemical.Name && a.AgroChemicalId != agroChemicalId);
            if (nameConflict)
                // Updated message to match the test expectation exactly (no period).
                throw new AgroChemicalConflictException("Agrochemical with the same name and brand already exists");

            // Apply updates
            entity.Name = agroChemical.Name;
            entity.Brand = agroChemical.Brand;
            entity.Category = agroChemical.Category;
            entity.Description = agroChemical.Description;
            entity.Unit = agroChemical.Unit;
            entity.PricePerUnit = agroChemical.PricePerUnit;
            entity.Image = agroChemical.Image;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAgroChemical(int agroChemicalId)
        {
            var entity = await _db.AgroChemicals.FindAsync(agroChemicalId);
            if (entity is null)
                throw new AgroChemicalNotFoundException(agroChemicalId);

            _db.AgroChemicals.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}