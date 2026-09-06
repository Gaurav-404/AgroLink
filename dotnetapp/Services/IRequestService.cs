using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using dotnetapp.Models;

namespace dotnetapp.Services
{
    public interface IRequestService
    {
        Task<IEnumerable<Request>> GetAllRequests();
        Task<Request?> GetRequestById(int requestId);
        Task<IEnumerable<Request>> GetRequestsByUserId(int userId);
        Task<bool> AddRequest(Request request);
        Task<bool> UpdateRequest(int requestId, Request request);
        Task<bool> DeleteRequest(int requestId);
    }
}