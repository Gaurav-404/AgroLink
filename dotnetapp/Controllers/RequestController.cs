using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using dotnetapp.Models;
using dotnetapp.Services;
using dotnetapp.Exceptions;

namespace dotnetapp.Controllers
{
    [ApiController]
    [Route("api/requests")]
    public class RequestController : ControllerBase
    {
        private readonly IRequestService _requestService;

        public RequestController(IRequestService requestService)
        {
            _requestService = requestService;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Request>>> GetAllRequests()
        {
            try
            {
                var requests = await _requestService.GetAllRequests();


                if (requests == null || !requests.Any())
                    throw new RequestException("No requests found.");

                return Ok(requests);
            }
            catch (RequestException rex)
            {

                return NotFound(rex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        [HttpGet("{requestId}")]
        public async Task<ActionResult<Request>> GetRequestById(int requestId)
        {
            try
            {
                if (requestId <= 0)
                    throw new RequestException("Invalid request id.");

                var request = await _requestService.GetRequestById(requestId);
                if (request == null)
                    throw new RequestException("Cannot find any request.");

                return Ok(request);
            }
            catch (RequestException rex)
            {
                return NotFound(rex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Request>>> GetRequestsByUserId(int userId)
        {
            try
            {
                if (userId <= 0)
                    throw new RequestException("Invalid user id.");

                var requests = await _requestService.GetRequestsByUserId(userId);


                if (requests == null || !requests.Any())
                    throw new RequestException("Cannot find any requests for the user.");

                return Ok(requests);
            }
            catch (RequestException rex)
            {
                return NotFound(rex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult> AddRequest([FromBody] Request request)
        {
            try
            {
                if (request == null)
                    throw new RequestException("Request payload is required.");

                if (request.UserId <= 0)
                    throw new RequestException("UserId is required.");
                if (request.CropId <= 0)
                    throw new RequestException("CropId is required.");
                if (request.AgroChemicalId == null || request.AgroChemicalId <= 0)
                    throw new RequestException("AgroChemicalId is required.");
                if (request.Quantity <= 0)
                    throw new RequestException("Quantity must be greater than zero.");


                request.Status = string.IsNullOrWhiteSpace(request.Status) ? "Pending" : request.Status;
                request.RequestDate = request.RequestDate == default ? DateTime.UtcNow : request.RequestDate;

                var result = await _requestService.AddRequest(request);
                if (!result)
                    throw new Exception("Failed to add request.");

                return Ok("Request added successfully.");
            }
            catch (RequestException rex)
            {
                return BadRequest(rex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        [HttpPut("{requestId}")]
        public async Task<ActionResult> UpdateRequest(int requestId, [FromBody] Request request)
        {
            try
            {
                if (requestId <= 0)
                    throw new RequestException("Invalid request id.");

                if (request == null)
                    throw new RequestException("Request payload is required.");


                var existing = await _requestService.GetRequestById(requestId);
                if (existing == null)
                    throw new RequestException("Cannot find any request.");


                if (request.Quantity <= 0)
                    throw new RequestException("Quantity must be greater than zero.");


                if (!string.IsNullOrWhiteSpace(request.Status))
                {
                    var allowed = new[] { "Pending", "Approved", "Rejected" };
                    if (!allowed.Contains(request.Status, StringComparer.OrdinalIgnoreCase))
                        throw new RequestException("Invalid status value.");
                }

                var result = await _requestService.UpdateRequest(requestId, request);
                if (!result)
                    throw new Exception("Failed to update request.");

                return Ok("Request updated successfully.");
            }
            catch (RequestException rex)
            {

                if (string.Equals(rex.Message, "Cannot find any request.", StringComparison.OrdinalIgnoreCase))
                    return NotFound(rex.Message);

                return BadRequest(rex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        [HttpDelete("{requestId}")]
        public async Task<ActionResult> DeleteRequest(int requestId)
        {
            try
            {
                if (requestId <= 0)
                    throw new RequestException("Invalid request id.");


                var existing = await _requestService.GetRequestById(requestId);
                if (existing == null)
                    throw new RequestException("Cannot find any request.");

                var result = await _requestService.DeleteRequest(requestId);
                if (!result)
                    throw new Exception("Failed to delete request.");

                return Ok("Request deleted successfully.");
            }
            catch (RequestException rex)
            {
                return NotFound(rex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}