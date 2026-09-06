

echo "🔧 Initializing user secrets..."
dotnet user-secrets init

echo "🔑Setting secrets..."
dotnet user-secrets set "ConnectionStrings:con" "user id=sa;password=examlyMssql@123;server=localhost;database=appdb;trusted_connection=false;persist security info=false;encrypt=false"
dotnet user-secrets set "Jwt:Secret" "super_secret_key_12345"
dotnet user-secrets set "Gemini:ApiKey" "AIzaSyDxYabRsCiUrWywaHZPqnD2T2QRtX_z5y4"

echo "✅ Secrets configured. Starting app..."
dotnet run