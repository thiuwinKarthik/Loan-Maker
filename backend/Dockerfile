# -------- Build Stage --------
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom first for dependency caching
COPY pom.xml .
RUN mvn -B -q -e -DskipTests dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests


# -------- Runtime Stage --------
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy built jar from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Use Render's PORT environment variable
CMD sh -c "java -Xms256m -Xmx512m -jar app.jar --server.port=${PORT} --server.address=0.0.0.0"