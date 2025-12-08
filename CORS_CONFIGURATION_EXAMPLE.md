# CORS Configuration for .NET Web API

This file contains example CORS configuration code for your .NET Web API backend.

## Instructions

Add the following CORS configuration to your `Program.cs` file (or `Startup.cs` if using older .NET versions).

## For .NET 6+ (Program.cs)

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Add CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS (must be before UseAuthorization)
app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

## For Production (More Secure)

For production environments, you should restrict CORS to specific origins:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy
            .WithOrigins(
                "http://localhost:5173",  // Vite dev server
                "http://localhost:3000",   // Alternative React dev port
                "https://yourdomain.com"  // Production domain
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());  // Only if you need to send cookies/auth headers
});
```

## For .NET Framework (WebApiConfig.cs or Startup.cs)

If you're using .NET Framework, add this to your `WebApiConfig.cs`:

```csharp
public static class WebApiConfig
{
    public static void Register(HttpConfiguration config)
    {
        // Enable CORS
        var cors = new EnableCorsAttribute("*", "*", "*");
        config.EnableCors(cors);
        
        // Web API configuration and services
        // ...
    }
}
```

Or in `Startup.cs`:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddCors(options =>
    {
        options.AddPolicy("AllowReact",
            policy => policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod());
    });
    
    // Other services...
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // Use CORS before other middleware
    app.UseCors("AllowReact");
    
    // Other middleware...
}
```

## Important Notes

1. **Order Matters**: `app.UseCors()` must be called before `app.UseAuthentication()` and `app.UseAuthorization()`.

2. **Development vs Production**: 
   - Use `AllowAnyOrigin()` for development
   - Use `WithOrigins()` with specific domains for production

3. **Credentials**: If you need to send cookies or authentication headers, use `AllowCredentials()` and specify exact origins (cannot use `AllowAnyOrigin()` with credentials).

4. **Testing**: After adding CORS, test your API endpoints from the React frontend to ensure they work correctly.

## Troubleshooting

If you encounter CORS errors:

1. Check that CORS middleware is added in the correct order
2. Verify the React app's base URL matches the allowed origins
3. Check browser console for specific CORS error messages
4. Ensure the API is running and accessible from the React app's origin

