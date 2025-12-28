package com.app.loveecho.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(
    basePackages = "com.app.loveecho.mongo.repository"
)
public class MongoConfig {
}
