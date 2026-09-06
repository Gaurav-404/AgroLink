using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using dotnetapp.Models;
using dotnetapp.Data;
using Microsoft.EntityFrameworkCore;



namespace dotnetapp.Services

{
    public class RequestService :IRequestService
    {
        private readonly ApplicationDbContext _context;
        public RequestService(ApplicationDbContext context)
        {

            _context = context;

        }
        public async Task<IEnumerable<Request>> GetAllRequests()

        {
            return await _context.Requests.Include(r => r.AgroChemical).Include(r => r.User).Include(r => r.Crop).ToListAsync();
        }
        public async Task<Request?> GetRequestById(int requestId)

        {

            return await _context.Requests

            .Include(r => r.AgroChemical)

            .Include(r => r.User)

            .Include(r => r.Crop)

            .FirstOrDefaultAsync(r => r.RequestId == requestId);

        }
        public async Task<IEnumerable<Request>> GetRequestsByUserId(int userId)

        {

            return await _context.Requests

            .Where(r => r.UserId == userId)

            .Include(r => r.AgroChemical)

            .Include(r => r.User)

            .Include(r => r.Crop)

            .ToListAsync();

        }
        public async Task<bool> AddRequest(Request request)

        {

            await _context.Requests.AddAsync(request);

            await _context.SaveChangesAsync();

            return true;

        }



        public async Task<bool> UpdateRequest(int requestId, Request request)

        {

            var existingRequest = await _context.Requests.FindAsync(requestId);

            if (existingRequest == null)

                return false;

            existingRequest.AgroChemicalId = request.AgroChemicalId;

            existingRequest.UserId = request.UserId;

            existingRequest.CropId = request.CropId;

            existingRequest.Quantity = request.Quantity;

            existingRequest.Status = request.Status;

            existingRequest.RequestDate = request.RequestDate;

            await _context.SaveChangesAsync();

            return true;

        }



        public async Task<bool> DeleteRequest(int requestId)

        {

            var request = await _context.Requests.FindAsync(requestId);

            if (request == null)

                return false;

            _context.Requests.Remove(request);

            await _context.SaveChangesAsync();

            return true;

        }

    }

}
