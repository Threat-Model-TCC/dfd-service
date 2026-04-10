using ThreatModelDfdService.Data.Converter.Impl;
using ThreatModelDfdService.Repositories;
using ThreatModelDfdService.Repositories.Impl;
using ThreatModelDfdService.Services;
using ThreatModelDfdService.Services.Impl;

namespace ThreatModelDfdService.Configs;

public static class DepencencyInjectionConfig
{
    public static IServiceCollection AddServiceDependencyConfiguration(this IServiceCollection services)
    {
        // Mappers
        services.AddScoped<DfdElementMapper>();

        // Repositories
        services.AddScoped(typeof(IRepository<>), typeof(GenericRepository<>));

        // Business Services
        services.AddScoped<DfdElementService>();
        services.AddScoped<DfdService>();
        services.AddScoped<ProjectService>();
        services.AddScoped<DataFlowService>();

        return services;
    }
}
