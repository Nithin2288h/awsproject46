package com.project46.config;

import com.project46.model.Task;
import com.project46.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(TaskRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.saveAll(List.of(
                    new Task("Learn Java REST APIs", false),
                    new Task("Build Project 46", false),
                    new Task("Practice Docker", false)
                ));
            }
        };
    }
}
