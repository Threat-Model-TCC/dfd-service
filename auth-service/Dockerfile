# =========================================================================
# Etapa 1: Build (Compilação e empacotamento)
# =========================================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Aproveita o cache de camadas do Docker para as dependências do Maven
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o código-fonte e gera o arquivo .jar
COPY src ./src
RUN mvn clean package -DskipTests

# =========================================================================
# Etapa 2: Runtime (Execução da aplicação)
# =========================================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Cria um usuário do sistema não-root por motivos de segurança
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copia apenas o arquivo .jar gerado na etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Define as variáveis de ambiente padrão do Spring Boot
ENV JAVA_OPTS="-XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

# Comando de inicialização otimizado
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]