# Use Java image
FROM eclipse-temurin:21-jdk-jammy

# Set working directory
WORKDIR /app

# Copy jar file
COPY target/*.jar app.jar

# Run app
CMD ["sh", "-c", "sleep 15 && java -jar app.jar"]