using dotnetapp.Exceptions;
using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace dotnetapp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/agrochemicals")]
    public class AgroChemicalController : ControllerBase
    {
        private readonly IAgroChemicalService service;

        public AgroChemicalController(IAgroChemicalService agroChemicalService)
        {
            service = agroChemicalService;
        }

        [Authorize(Roles = "Admin,Seller,User,Farmer")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AgroChemical>>> GetAllAgroChemicals()
        {
            var list = await service.GetAllAgroChemicals();
            return Ok(list);
        }

        [Authorize(Roles = "Admin,Seller,Farmer")]
        [HttpGet("{agroChemicalId:int}")]
        public async Task<ActionResult<AgroChemical>> GetAgroChemicalByld(int agroChemicalId)
        {
            try
            {
                var agroChemical = await service.GetAgroChemicalByld(agroChemicalId);
                if (agroChemical == null)
                    return NotFound(new ProblemDetails
                    {
                        Title = "Agrochemical not found",
                        Detail = "Cannot find any agrochemical",
                        Status = StatusCodes.Status404NotFound
                    });

                return Ok(agroChemical);
            }
            catch (AgroChemicalNotFoundException ex)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Agrochemical not found",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound
                });
            }
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpPost]
        public async Task<ActionResult> AddAgroChemical([FromBody] AgroChemical agroChemical)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            try
            {
                if (!string.IsNullOrWhiteSpace(agroChemical.Image))
                {
                    var img = agroChemical.Image.Trim();
                    // Only normalize if it's a file path, NOT a base64 data URI
                    if (!img.StartsWith("data:"))
                    {
                        agroChemical.Image = Path.GetFileName(img);
                    }
                }

                var success = await service.AddAgroChemical(agroChemical);
                if (success)
                    return CreatedAtAction(nameof(GetAgroChemicalByld),
                        new { agroChemicalId = agroChemical.AgroChemicalId }, agroChemical);

                return StatusCode(StatusCodes.Status500InternalServerError, "Failed to add agrochemical");
            }
            catch (AgroChemicalConflictException ex)
            {
                return Conflict(new ProblemDetails
                {
                    Title = "Conflict",
                    Detail = ex.Message,
                    Status = StatusCodes.Status409Conflict
                });
            }
            catch (AgroChemicalValidationException ex)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Validation error",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
            catch (AgroChemicalException ex)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Agrochemical error",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Server error",
                    Detail = ex.Message,
                    Status = StatusCodes.Status500InternalServerError
                });
            }
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpPut("{agroChemicalId:int}")]
        public async Task<ActionResult> UpdateAgroChemical(int agroChemicalId, [FromBody] AgroChemical agroChemical)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            try
            {
                if (!string.IsNullOrWhiteSpace(agroChemical.Image))
                {
                    var img = agroChemical.Image.Trim();
                    // Only normalize if it's a file path, NOT a base64 data URI
                    if (!img.StartsWith("data:"))
                    {
                        agroChemical.Image = Path.GetFileName(img);
                    }
                }

                var success = await service.UpdateAgroChemical(agroChemicalId, agroChemical);
                if (success)
                    return Ok("Agrochemical updated successfully");

                return NotFound(new ProblemDetails
                {
                    Title = "Agrochemical not found",
                    Detail = "Cannot find any agrochemical",
                    Status = StatusCodes.Status404NotFound
                });
            }
            catch (AgroChemicalNotFoundException ex)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Agrochemical not found",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound
                });
            }
            catch (AgroChemicalConflictException ex)
            {
                return Conflict(new ProblemDetails
                {
                    Title = "Conflict",
                    Detail = ex.Message,
                    Status = StatusCodes.Status409Conflict
                });
            }
            catch (AgroChemicalValidationException ex)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Validation error",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
            catch (AgroChemicalException ex)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Agrochemical error",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Server error",
                    Detail = ex.Message,
                    Status = StatusCodes.Status500InternalServerError
                });
            }
        }

        [Authorize(Roles = "Admin,Seller")]
        [HttpDelete("{agroChemicalId:int}")]
        public async Task<ActionResult> DeleteAgroChemical(int agroChemicalId)
        {
            try
            {
                var success = await service.DeleteAgroChemical(agroChemicalId);
                if (success)
                    return Ok("Agrochemical deleted successfully");

                return NotFound(new ProblemDetails
                {
                    Title = "Agrochemical not found",
                    Detail = "Cannot find any agrochemical",
                    Status = StatusCodes.Status404NotFound
                });
            }
            catch (AgroChemicalNotFoundException ex)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Agrochemical not found",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound
                });
            }
            catch (AgroChemicalException ex)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Agrochemical error",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Server error",
                    Detail = ex.Message,
                    Status = StatusCodes.Status500InternalServerError
                });
            }
        }
    }
}