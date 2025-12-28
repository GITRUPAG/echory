package com.app.loveecho.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(
    basePackages = "com.app.loveecho.jpa.repository"
)
public class JpaConfig {
}
