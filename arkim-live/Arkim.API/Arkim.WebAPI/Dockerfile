# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Arkim.WebAPI/Arkim.WebAPI.csproj", "Arkim.WebAPI/"]
RUN dotnet restore "./Arkim.WebAPI/Arkim.WebAPI.csproj"
COPY . .
WORKDIR "/src/Arkim.WebAPI"
RUN dotnet build "./Arkim.WebAPI.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Arkim.WebAPI.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Add health check for App Runner
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD curl -f http://localhost:8080/health || exit 1

# Set environment variables for AWS SDK
ENV AWS_SDK_USE_CONNECTED_CREDENTIALS=true
ENV AWS_ENABLE_ENDPOINT_DISCOVERY=true

ENTRYPOINT ["dotnet", "Arkim.WebAPI.dll"]