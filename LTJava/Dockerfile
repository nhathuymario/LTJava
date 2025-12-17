# Sử dụng image Java 17 thực tế và có sẵn
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy file jar mới vừa build ở Bước 2
COPY target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]