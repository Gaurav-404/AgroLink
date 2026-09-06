using dotnetapp.Exceptions;
using dotnetapp.Models;
using dotnetapp.Data;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System.Linq;
using System.Reflection;
using dotnetapp.Services;
using System;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Net;
using System.Net.Http;
using System.Text;

namespace dotnetapp.Tests
{
    [TestFixture]
    public class Tests
    {

        private ApplicationDbContext _context; 
        private HttpClient _httpClient;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(databaseName: "TestDatabase").Options;
            _context = new ApplicationDbContext(options);
           
             _httpClient = new HttpClient();
             _httpClient.BaseAddress = new Uri("http://localhost:8080");

        }

        [TearDown]
        public void TearDown()
        {
             _context.Dispose();
        }

   [Test, Order(1)]
    public async Task Backend_Test_Post_Method_Register_Farmer_Returns_HttpStatusCode_OK()
    {
        ClearDatabase();
        string uniqueId = Guid.NewGuid().ToString();

        // Generate a unique userName based on a timestamp
        string uniqueUsername = $"abcd_{uniqueId}";
        string uniqueEmail = $"abcd{uniqueId}@gmail.com";

        string requestBody = $"{{\"Username\": \"{uniqueUsername}\", \"Password\": \"abc@123A\", \"Email\": \"{uniqueEmail}\", \"MobileNumber\": \"1234567890\", \"UserRole\": \"Farmer\"}}";
        HttpResponseMessage response = await _httpClient.PostAsync("/api/register", new StringContent(requestBody, Encoding.UTF8, "application/json"));

        Console.WriteLine(response.StatusCode);
        string responseString = await response.Content.ReadAsStringAsync();

        Console.WriteLine(responseString);
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
    }
  
   [Test, Order(2)]
    public async Task Backend_Test_Post_Method_Login_Farmer_Returns_HttpStatusCode_OK()
    {
        ClearDatabase();

        string uniqueId = Guid.NewGuid().ToString();

        // Generate a unique userName based on a timestamp
        string uniqueUsername = $"abcd_{uniqueId}";
        string uniqueEmail = $"abcd{uniqueId}@gmail.com";

        string requestBody = $"{{\"Username\": \"{uniqueUsername}\", \"Password\": \"abc@123A\", \"Email\": \"{uniqueEmail}\", \"MobileNumber\": \"1234567890\", \"UserRole\": \"Farmer\"}}";
        HttpResponseMessage response = await _httpClient.PostAsync("/api/register", new StringContent(requestBody, Encoding.UTF8, "application/json"));

        // Print registration response
        string registerResponseBody = await response.Content.ReadAsStringAsync();
        Console.WriteLine("Registration Response: " + registerResponseBody);

        // Login with the registered user
        string loginRequestBody = $"{{\"Email\" : \"{uniqueEmail}\",\"Password\" : \"abc@123A\"}}"; // Updated variable names
        HttpResponseMessage loginResponse = await _httpClient.PostAsync("/api/login", new StringContent(loginRequestBody, Encoding.UTF8, "application/json"));

        // Print login response
        string loginResponseBody = await loginResponse.Content.ReadAsStringAsync();
        Console.WriteLine("Login Response: " + loginResponseBody);

        Assert.AreEqual(HttpStatusCode.OK, loginResponse.StatusCode);
    }
[Test, Order(3)]
public async Task Backend_Test_Get_All_AgroChemicals_With_Token_By_Farmer_Returns_HttpStatusCode_OK()
{
    ClearDatabase();
    string uniqueId = Guid.NewGuid().ToString();

    // Generate a unique userName based on a timestamp
    string uniqueUsername = $"abcd_{uniqueId}";
    string uniqueEmail = $"abcd{uniqueId}@gmail.com";

    string requestBody = $"{{\"Username\": \"{uniqueUsername}\", \"Password\": \"abc@123A\", \"Email\": \"{uniqueEmail}\", \"MobileNumber\": \"1234567890\", \"UserRole\": \"Farmer\"}}";
    HttpResponseMessage response = await _httpClient.PostAsync("/api/register", new StringContent(requestBody, Encoding.UTF8, "application/json"));

    // Print registration response
    string registerResponseBody = await response.Content.ReadAsStringAsync();
    Console.WriteLine("Registration Response: " + registerResponseBody);

    // Login with the registered user
    string loginRequestBody = $"{{\"Email\" : \"{uniqueEmail}\",\"Password\" : \"abc@123A\"}}"; // Updated variable names
    HttpResponseMessage loginResponse = await _httpClient.PostAsync("/api/login", new StringContent(loginRequestBody, Encoding.UTF8, "application/json"));

    // Print login response
    string loginResponseBody = await loginResponse.Content.ReadAsStringAsync();
    Console.WriteLine("Login Response: " + loginResponseBody);

    Assert.AreEqual(HttpStatusCode.OK, loginResponse.StatusCode);
    string responseBody = await loginResponse.Content.ReadAsStringAsync();

    dynamic responseMap = JsonConvert.DeserializeObject(responseBody);

    string token = responseMap.token;

    Assert.IsNotNull(token);

    // Use the token to get all feeds
    _httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + token);
    HttpResponseMessage feedResponse = await _httpClient.GetAsync("/api/agrochemicals");

    // Print feed response
    string feedResponseBody = await feedResponse.Content.ReadAsStringAsync();
    Console.WriteLine("Feed Response: " + feedResponseBody);

    Assert.AreEqual(HttpStatusCode.OK, feedResponse.StatusCode);
}

[Test, Order(4)]
public async Task Backend_Test_Get_All_AgroChemicals_Without_Token_By_Farmer_Returns_HttpStatusCode_Unauthorized()
{
    ClearDatabase();
    string uniqueId = Guid.NewGuid().ToString();

    // Generate a unique userName based on a timestamp
    string uniqueUsername = $"abcd_{uniqueId}";
    string uniqueEmail = $"abcd{uniqueId}@gmail.com";

    string requestBody = $"{{\"Username\": \"{uniqueUsername}\", \"Password\": \"abc@123A\", \"Email\": \"{uniqueEmail}\", \"MobileNumber\": \"1234567890\", \"UserRole\": \"Farmer\"}}";
    HttpResponseMessage response = await _httpClient.PostAsync("/api/register", new StringContent(requestBody, Encoding.UTF8, "application/json"));

    // Print registration response
    string registerResponseBody = await response.Content.ReadAsStringAsync();
    Console.WriteLine("Registration Response: " + registerResponseBody);

    // Login with the registered user
    string loginRequestBody = $"{{\"Email\" : \"{uniqueEmail}\",\"Password\" : \"abc@123A\"}}"; // Updated variable names
    HttpResponseMessage loginResponse = await _httpClient.PostAsync("/api/login", new StringContent(loginRequestBody, Encoding.UTF8, "application/json"));

    // Print login response
    string loginResponseBody = await loginResponse.Content.ReadAsStringAsync();
    Console.WriteLine("Login Response: " + loginResponseBody);

    Assert.AreEqual(HttpStatusCode.OK, loginResponse.StatusCode);
    string responseBody = await loginResponse.Content.ReadAsStringAsync();

    HttpResponseMessage feedResponse = await _httpClient.GetAsync("/api/agrochemicals");

    // Print feed response
    string feedResponseBody = await feedResponse.Content.ReadAsStringAsync();
    Console.WriteLine("Feed Response: " + feedResponseBody);

    Assert.AreEqual(HttpStatusCode.Unauthorized, feedResponse.StatusCode);
}


[Test, Order(5)]
public async Task Backend_Test_GetAll_Method_Get_All_Crops_In_Crop_Service_Fetches_All_Crops_Successfully()
{
    ClearDatabase();
 var userData = new Dictionary<string, object>
    {
        { "UserId", 1 },
        { "Username", "testuser" },
        { "Password", "testpassword" },
        { "Email", "test@example.com" },
        { "MobileNumber", "1234567890" },
        { "UserRole", "User" }
    };

    var user = new User();
    foreach (var kvp in userData)
    {
        var propertyInfo = typeof(User).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(user, kvp.Value);
        }
    }
    _context.Users.Add(user);
    _context.SaveChanges();
    // Set up crop data
    var cropData1 = new Dictionary<string, object>
    {
        { "CropId", 1 },
        { "UserId", 1 },
        { "CropName", "Crop One" },
        { "CropType", "Type One" },
        { "Description", "First crop description" },
        { "PlantingDate", DateTime.Now }
    };

    var cropData2 = new Dictionary<string, object>
    {
        { "CropId", 2 },
        { "UserId", 1 },
        { "CropName", "Crop Two" },
        { "CropType", "Type Two" },
        { "Description", "Second crop description" },
        { "PlantingDate", DateTime.Now }
    };

    var crop1 = new Crop();
    foreach (var kvp in cropData1)
    {
        var propertyInfo = typeof(Crop).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(crop1, kvp.Value);
        }
    }

    var crop2 = new Crop();
    foreach (var kvp in cropData2)
    {
        var propertyInfo = typeof(Crop).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(crop2, kvp.Value);
        }
    }

    _context.Crops.Add(crop1);
    _context.Crops.Add(crop2);
    await _context.SaveChangesAsync();

    // Load assembly and types
    string assemblyName = "dotnetapp";
    Assembly assembly = Assembly.Load(assemblyName);
    string serviceName = "dotnetapp.Services.CropService";

    Type serviceType = assembly.GetType(serviceName);

    // Get the GetAllCrops method
    MethodInfo getAllCropsMethod = serviceType.GetMethod("GetAllCrops");

    // Check if method exists
    if (getAllCropsMethod != null)
    {
        var service = Activator.CreateInstance(serviceType, _context);
        var retrievedCropsTask = (Task<IEnumerable<Crop>>)getAllCropsMethod.Invoke(service, null);
        var retrievedCrops = await retrievedCropsTask;

        // Assert the retrieved crops are not null and match the expected count
        Assert.IsNotNull(retrievedCrops);
        Assert.AreEqual(2, retrievedCrops.Count());
    }
    else
    {
        Assert.Fail();
    }
}

[Test, Order(6)]
public async Task Backend_Test_GetById_Method_Get_Crop_By_Id_In_Crop_Service_Fetches_Crop_Successfully()
{
    ClearDatabase();
    var userData = new Dictionary<string, object>
    {
        { "UserId", 1 },
        { "Username", "testuser" },
        { "Password", "testpassword" },
        { "Email", "test@example.com" },
        { "MobileNumber", "1234567890" },
        { "UserRole", "User" }
    };

    var user = new User();
    foreach (var kvp in userData)
    {
        var propertyInfo = typeof(User).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(user, kvp.Value);
        }
    }
    _context.Users.Add(user);
    _context.SaveChanges();
    // Set up crop data
    var cropData = new Dictionary<string, object>
    {
        { "CropId", 1 },
        { "UserId", 1 },
        { "CropName", "Crop One" },
        { "CropType", "Type One" },
        { "Description", "First crop description" },
        { "PlantingDate", DateTime.Now }
    };
    var crop = new Crop();
    foreach (var kvp in cropData)
    {
        var propertyInfo = typeof(Crop).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(crop, kvp.Value);
        }
    }

    _context.Crops.Add(crop);
    await _context.SaveChangesAsync();

    // Load assembly and types
    string assemblyName = "dotnetapp";
    Assembly assembly = Assembly.Load(assemblyName);
    string serviceName = "dotnetapp.Services.CropService";

    Type serviceType = assembly.GetType(serviceName);

    // Get the GetCropById method
    MethodInfo getCropByIdMethod = serviceType.GetMethod("GetCropById");

    // Check if method exists
    if (getCropByIdMethod != null)
    {
        var service = Activator.CreateInstance(serviceType, _context);
        var retrievedCropTask = (Task<Crop>)getCropByIdMethod.Invoke(service, new object[] { 1 });
        var retrievedCrop = await retrievedCropTask;

        // Assert the retrieved crop is not null and matches the expected data
        Assert.IsNotNull(retrievedCrop);
        Assert.AreEqual("Crop One", retrievedCrop.CropName);
    }
    else
    {
        Assert.Fail();
    }
}
[Test, Order(7)]
public async Task Backend_Test_GetAll_Method_Get_All_AgroChemicals_In_AgroChemical_Service_Fetches_All_AgroChemicals_Successfully()
{
    ClearDatabase();

    // Set up agrochemical data
    var agroChemicalData1 = new Dictionary<string, object>
    {
        { "AgroChemicalId", 1 },
        { "Name", "AgroChemical One" },
        { "Brand", "Brand One" },
        { "Category", "Category One" },
        { "Description", "First agrochemical description" },
        { "Quantity", 100 },
        { "Unit", "Unit One" },
        { "PricePerUnit", 10.00m },
        { "Image", "image_url" }
    };

    var agroChemicalData2 = new Dictionary<string, object>
    {
        { "AgroChemicalId", 2 },
        { "Name", "AgroChemical Two" },
        { "Brand", "Brand Two" },
        { "Category", "Category Two" },
        { "Description", "Second agrochemical description" },
        { "Quantity", 200 },
        { "Unit", "Unit Two" },
        { "PricePerUnit", 20.00m },
        { "Image", "image_url" }
    };

    var agroChemical1 = new AgroChemical();
    foreach (var kvp in agroChemicalData1)
    {
        var propertyInfo = typeof(AgroChemical).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(agroChemical1, kvp.Value);
        }
    }

    var agroChemical2 = new AgroChemical();
    foreach (var kvp in agroChemicalData2)
    {
        var propertyInfo = typeof(AgroChemical).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(agroChemical2, kvp.Value);
        }
    }

    _context.AgroChemicals.Add(agroChemical1);
    _context.AgroChemicals.Add(agroChemical2);
    await _context.SaveChangesAsync();

    // Load assembly and types
    string assemblyName = "dotnetapp";
    Assembly assembly = Assembly.Load(assemblyName);
    string serviceName = "dotnetapp.Services.AgroChemicalService";

    Type serviceType = assembly.GetType(serviceName);

    // Get the GetAllAgroChemicals method
    MethodInfo getAllAgroChemicalsMethod = serviceType.GetMethod("GetAllAgroChemicals");

    // Check if method exists
    if (getAllAgroChemicalsMethod != null)
    {
        var service = Activator.CreateInstance(serviceType, _context);
        var retrievedAgroChemicalsTask = (Task<IEnumerable<AgroChemical>>)getAllAgroChemicalsMethod.Invoke(service, null);
        var retrievedAgroChemicals = await retrievedAgroChemicalsTask;

        // Assert the retrieved agrochemicals are not null and match the expected count
        Assert.IsNotNull(retrievedAgroChemicals);
        Assert.AreEqual(2, retrievedAgroChemicals.Count());
    }
    else
    {
        Assert.Fail();
    }
}

[Test, Order(8)]
public async Task Backend_Test_Delete_Method_Delete_AgroChemical_In_AgroChemical_Service_Deletes_AgroChemical_Successfully()
{
    ClearDatabase();

    // Set up agrochemical data
    var agroChemicalData = new Dictionary<string, object>
    {
        { "AgroChemicalId", 1 },
        { "Name", "AgroChemical One" },
        { "Brand", "Brand One" },
        { "Category", "Category One" },
        { "Description", "First agrochemical description" },
        { "Quantity", 100 },
        { "Unit", "Unit One" },
        { "PricePerUnit", 10.00m },
        { "Image", "image_url" }
    };

    var agroChemical = new AgroChemical();
    foreach (var kvp in agroChemicalData)
    {
        var propertyInfo = typeof(AgroChemical).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(agroChemical, kvp.Value);
        }
    }

    _context.AgroChemicals.Add(agroChemical);
    await _context.SaveChangesAsync();

    // Load assembly and types
    string assemblyName = "dotnetapp";
    Assembly assembly = Assembly.Load(assemblyName);
    string serviceName = "dotnetapp.Services.AgroChemicalService";

    Type serviceType = assembly.GetType(serviceName);

    // Get the DeleteAgroChemical method
    MethodInfo deleteAgroChemicalMethod = serviceType.GetMethod("DeleteAgroChemical");

    // Check if method exists
    if (deleteAgroChemicalMethod != null)
    {
        var service = Activator.CreateInstance(serviceType, _context);
        var result = (Task<bool>)deleteAgroChemicalMethod.Invoke(service, new object[] { 1 });
        var isSuccess = await result;
        // Verify that the agrochemical was deleted
        var deletedAgroChemical = await _context.AgroChemicals.FindAsync(1);

        // Assert that the deleted agrochemical is null
        Assert.IsNull(deletedAgroChemical);
    }
    else
    {
        Assert.Fail();
    }
}

[Test, Order(9)]
public async Task Backend_Test_Post_Method_Add_AgroChemical_In_AgroChemicalService_Adds_AgroChemical_Successfully()
{
    ClearDatabase();

    // Set up agrochemical data
    var agroChemicalData = new Dictionary<string, object>
    {
        { "AgroChemicalId", 1 },
        { "Name", "AgroChemical One" },
        { "Brand", "Brand One" },
        { "Category", "Herbicide" },
        { "Description", "First agrochemical description" },
        { "Quantity", 100 },
        { "Unit", "Liters" },
        { "PricePerUnit", 50.0m },
        { "Image", "http://example.com/image1.jpg" }
    };

    var agroChemical = new AgroChemical();
    foreach (var kvp in agroChemicalData)
    {
        var propertyInfo = typeof(AgroChemical).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(agroChemical, kvp.Value);
        }
    }

    // Load assembly and types
    string assemblyName = "dotnetapp";
    Assembly assembly = Assembly.Load(assemblyName);
    string serviceName = "dotnetapp.Services.AgroChemicalService";

    Type serviceType = assembly.GetType(serviceName);

    // Get the AddAgroChemical method
    MethodInfo addAgroChemicalMethod = serviceType.GetMethod("AddAgroChemical");

    // Check if method exists
    if (addAgroChemicalMethod != null)
    {
        var service = Activator.CreateInstance(serviceType, _context);
        var addAgroChemicalTask = (Task<bool>)addAgroChemicalMethod.Invoke(service, new object[] { agroChemical });
        var result = await addAgroChemicalTask;

        // Assert that the agrochemical was added successfully
        Assert.IsTrue(result);

        // Verify that the agrochemical was added
        var retrievedAgroChemical = await _context.AgroChemicals.FindAsync(1);

        // Assert the retrieved agrochemical is not null and properties match
        Assert.IsNotNull(retrievedAgroChemical);
        Assert.AreEqual(agroChemical.Name, retrievedAgroChemical.Name);
    }
    else
    {
        Assert.Fail();
    }
}

[Test, Order(10)]
public async Task Backend_Test_Post_Method_Add_AgroChemical_In_AgroChemicalService_Throws_AgroChemicalException_If_Name_And_Brand_Exists()
{
    ClearDatabase();

    // Set up initial agrochemical data
    var initialAgroChemicalData = new Dictionary<string, object>
    {
        { "AgroChemicalId", 1 },
        { "Name", "AgroChemical One" },
        { "Brand", "Brand One" },
        { "Category", "Herbicide" },
        { "Description", "First agrochemical description" },
        { "Quantity", 100 },
        { "Unit", "Liters" },
        { "PricePerUnit", 50.0m },
        { "Image", "http://example.com/image1.jpg" }
    };

    var initialAgroChemical = new AgroChemical();
    foreach (var kvp in initialAgroChemicalData)
    {
        var propertyInfo = typeof(AgroChemical).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(initialAgroChemical, kvp.Value);
        }
    }
    _context.AgroChemicals.Add(initialAgroChemical);
    await _context.SaveChangesAsync();

    // Load assembly and types
    string assemblyName = "dotnetapp";
    Assembly assembly = Assembly.Load(assemblyName);
    string serviceName = "dotnetapp.Services.AgroChemicalService";

    Type serviceType = assembly.GetType(serviceName);

    // Get the AddAgroChemical method
    MethodInfo addAgroChemicalMethod = serviceType.GetMethod("AddAgroChemical");

    // Check if method exists
    if (addAgroChemicalMethod != null)
    {
        var service = Activator.CreateInstance(serviceType, _context);

        // Attempt to add a new agrochemical with the same name and brand
        var newAgroChemicalData = new Dictionary<string, object>
        {
            { "AgroChemicalId", 2 },
            { "Name", "AgroChemical One" },
            { "Brand", "Brand One" },
            { "Category", "Pesticide" },
            { "Description", "Second agrochemical description" },
            { "Quantity", 200 },
            { "Unit", "Kilograms" },
            { "PricePerUnit", 60.0m },
            { "Image", "http://example.com/image2.jpg" }
        };

        var newAgroChemical = new AgroChemical();
        foreach (var kvp in newAgroChemicalData)
        {
            var propertyInfo = typeof(AgroChemical).GetProperty(kvp.Key);
            if (propertyInfo != null)
            {
                propertyInfo.SetValue(newAgroChemical, kvp.Value);
            }
        }

        try
        {
            var addAgroChemicalTask = (Task<bool>)addAgroChemicalMethod.Invoke(service, new object[] { newAgroChemical });
           Console.WriteLine("res" + addAgroChemicalTask.Result);
            // If no exception is thrown, fail the test
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.IsNotNull(ex.InnerException);
            Assert.IsTrue(ex.InnerException is AgroChemicalException);
            Assert.AreEqual("Agrochemical with the same name and brand already exists", ex.InnerException.Message);
        }
    }
    else
    {
        Assert.Fail();
    }
}


[Test, Order(11)]
public async Task Backend_Test_Post_Method_AddFeedback_In_Feedback_Service_Posts_Successfully()
{
        ClearDatabase();

    // Add user
    var userData = new Dictionary<string, object>
    {
        { "UserId",42 },
        { "Username", "testuser" },
        { "Password", "testpassword" },
        { "Email", "test@example.com" },
        { "MobileNumber", "1234567890" },
        { "UserRole", "Farmer" }
    };

    var user = new User();
    foreach (var kvp in userData)
    {
        var propertyInfo = typeof(User).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(user, kvp.Value);
        }
    }
    _context.Users.Add(user);
    _context.SaveChanges();
    // Add loan application
    string assemblyName = "dotnetapp";
    Assembly assembly = Assembly.Load(assemblyName);
    string ServiceName = "dotnetapp.Services.FeedbackService";
    string typeName = "dotnetapp.Models.Feedback";

    Type serviceType = assembly.GetType(ServiceName);
    Type modelType = assembly.GetType(typeName);

    MethodInfo method = serviceType.GetMethod("AddFeedback", new[] { modelType });

    if (method != null)
    {
           var feedbackData = new Dictionary<string, object>
            {
                { "FeedbackId", 11 },
                { "UserId", 42 },
                { "FeedbackText", "Great experience!" },
                { "Date", DateTime.Now }
            };
        var feedback = new Feedback();
        foreach (var kvp in feedbackData)
        {
            var propertyInfo = typeof(Feedback).GetProperty(kvp.Key);
            if (propertyInfo != null)
            {
                propertyInfo.SetValue(feedback, kvp.Value);
            }
        }
        var service = Activator.CreateInstance(serviceType, _context);
        var result = (Task<bool>)method.Invoke(service, new object[] { feedback });
    
        var addedFeedback= await _context.Feedbacks.FindAsync(11);
        Assert.IsNotNull(addedFeedback);
        Assert.AreEqual("Great experience!",addedFeedback.FeedbackText);

    }
    else{
        Assert.Fail();
    }
}

[Test, Order(12)]
public async Task Backend_Test_Delete_Method_Feedback_In_Feeback_Service_Deletes_Successfully()
{
    // Add user
     ClearDatabase();

    var userData = new Dictionary<string, object>
    {
        { "UserId",42 },
        { "Username", "testuser" },
        { "Password", "testpassword" },
        { "Email", "test@example.com" },
        { "MobileNumber", "1234567890" },
        { "UserRole", "Farmer" }
    };

    var user = new User();
    foreach (var kvp in userData)
    {
        var propertyInfo = typeof(User).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(user, kvp.Value);
        }
    }
    _context.Users.Add(user);
    _context.SaveChanges();

           var feedbackData = new Dictionary<string, object>
            {
                { "FeedbackId", 11 },
                { "UserId", 42 },
                { "FeedbackText", "Great experience!" },
                { "Date", DateTime.Now }
            };
        var feedback = new Feedback();
        foreach (var kvp in feedbackData)
        {
            var propertyInfo = typeof(Feedback).GetProperty(kvp.Key);
            if (propertyInfo != null)
            {
                propertyInfo.SetValue(feedback, kvp.Value);
            }
        }
     _context.Feedbacks.Add(feedback);
    _context.SaveChanges();
    // Add loan application
    string assemblyName = "dotnetapp";
    Assembly assembly = Assembly.Load(assemblyName);
    string ServiceName = "dotnetapp.Services.FeedbackService";
    string typeName = "dotnetapp.Models.Feedback";

    Type serviceType = assembly.GetType(ServiceName);
    Type modelType = assembly.GetType(typeName);

  
    MethodInfo deletemethod = serviceType.GetMethod("DeleteFeedback", new[] { typeof(int) });

    if (deletemethod != null)
    {
        var service = Activator.CreateInstance(serviceType, _context);
        var deleteResult = (Task<bool>)deletemethod.Invoke(service, new object[] { 11 });

        var deletedFeedbackFromDb = await _context.Feedbacks.FindAsync(11);
        Assert.IsNull(deletedFeedbackFromDb);
    }
    else
    {
        Assert.Fail();
    }
}

[Test, Order(13)]
public async Task Backend_Test_Get_Method_GetFeedbacksByUserId_In_Feedback_Service_Fetches_Successfully()
{
    ClearDatabase();

    // Add user
    var userData = new Dictionary<string, object>
    {
        { "UserId", 330 },
        { "Username", "testuser" },
        { "Password", "testpassword" },
        { "Email", "test@example.com" },
        { "MobileNumber", "1234567890" },
        { "UserRole", "Farmer" }
    };

    var user = new User();
    foreach (var kvp in userData)
    {
        var propertyInfo = typeof(User).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(user, kvp.Value);
        }
    }
    _context.Users.Add(user);
    _context.SaveChanges();

    var feedbackData= new Dictionary<string, object>
    {
        { "FeedbackId", 13 },
        { "UserId", 330 },
        { "FeedbackText", "Great experience!" },
        { "Date", DateTime.Now }
    };

    var feedback = new Feedback();
    foreach (var kvp in feedbackData)
    {
        var propertyInfo = typeof(Feedback).GetProperty(kvp.Key);
        if (propertyInfo != null)
        {
            propertyInfo.SetValue(feedback, kvp.Value);
        }
    }
    _context.Feedbacks.Add(feedback);
    _context.SaveChanges();

    // Add loan application
    string assemblyName = "dotnetapp";
    Assembly assembly = Assembly.Load(assemblyName);
    string ServiceName = "dotnetapp.Services.FeedbackService";
    string typeName = "dotnetapp.Models.Feedback";

    Type serviceType = assembly.GetType(ServiceName);
    Type modelType = assembly.GetType(typeName);

    MethodInfo method = serviceType.GetMethod("GetFeedbacksByUserId");

    if (method != null)
    {
        var service = Activator.CreateInstance(serviceType, _context);
        var result = ( Task<IEnumerable<Feedback>>)method.Invoke(service, new object[] {330});
        Assert.IsNotNull(result);
         var check=true;
        foreach (var item in result.Result)
        {
            check=false;
            Assert.AreEqual("Great experience!", item.FeedbackText);
   
        }
        if(check==true)
        {
            Assert.Fail();

        }
    }
    else{
        Assert.Fail();
    }
}

private void ClearDatabase()
{
    _context.Database.EnsureDeleted();
    _context.Database.EnsureCreated();
}

}
}

