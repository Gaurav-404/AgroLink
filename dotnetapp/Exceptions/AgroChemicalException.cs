using System;

namespace dotnetapp.Exceptions
{
    // Base exception for all agrochemical-specific errors
    public class AgroChemicalException : Exception
    {
        public AgroChemicalException(string message) : base(message) { }
    }

    // 404 - Not found
    public sealed class AgroChemicalNotFoundException : AgroChemicalException
    {
        public int? AgroChemicalId { get; }
        public AgroChemicalNotFoundException(int? id = null, string? message = null)
            : base(message ?? $"Agrochemical{(id is null ? "" : $" #{id}")} not found.")
        {
            AgroChemicalId = id;
        }
    }

    // 400 - Validation / business rule violation
    public sealed class AgroChemicalValidationException : AgroChemicalException
    {
        public AgroChemicalValidationException(string message) : base(message) { }
    }

    // 409 - Conflicts (e.g., duplicate name)
    public sealed class AgroChemicalConflictException : AgroChemicalException
    {
        public AgroChemicalConflictException(string message) : base(message) { }
    }
}
