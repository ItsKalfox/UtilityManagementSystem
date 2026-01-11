package com.utilitymanagementsystem.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(
            String to,
            String fullName,
            String rawPassword
    ) {

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Your Password Has Been Reset");
            helper.setFrom("no-reply@ums.com");

            ClassPathResource htmlFile =
                    new ClassPathResource("static/common/password-reset.html");

            String html = new String(
                    htmlFile.getInputStream().readAllBytes(),
                    StandardCharsets.UTF_8
            );

            html = html.replace("{{FULL_NAME}}", fullName);
            html = html.replace("{{PASSWORD}}", rawPassword);

            helper.setText(html, true);

            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}