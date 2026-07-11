package com.strongtracking.service;

import com.strongtracking.model.User;
import com.strongtracking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AdminSeedService {

    @Value("${app.admin-email:}")
    private String adminEmail;

    private final UserRepository userRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedAdmin() {
        if (adminEmail == null || adminEmail.isBlank()) {
            return;
        }
        userRepository.findByEmail(adminEmail).ifPresent(user -> {
            if (!user.isAdmin()) {
                user.setAdmin(true);
                userRepository.save(user);
            }
        });
    }
}
