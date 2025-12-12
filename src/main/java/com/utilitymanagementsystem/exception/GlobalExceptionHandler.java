package com.utilitymanagementsystem.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 401 — Authentication Errors (invalid login, invalid token, expired token)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntime(RuntimeException ex) {
        return new ResponseEntity<>(
                new ApiError(401, ex.getMessage()),
                HttpStatus.UNAUTHORIZED
        );
    }

    // 403 — Authorization Errors (permission denied)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex) {
        return new ResponseEntity<>(
                new ApiError(403, "Access Denied"),
                HttpStatus.FORBIDDEN
        );
    }

    // 400 — Bad Request (Invalid input from client)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleBadRequest(IllegalArgumentException ex) {
        return new ResponseEntity<>(
                new ApiError(400, ex.getMessage()),
                HttpStatus.BAD_REQUEST
        );
    }

    // 400 — Malformed JSON or unreadable request body
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleInvalidJson(HttpMessageNotReadableException ex) {
        return new ResponseEntity<>(
                new ApiError(400, "Malformed JSON request"),
                HttpStatus.BAD_REQUEST
        );
    }

    // 404 — Resource Not Found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        return new ResponseEntity<>(
                new ApiError(404, ex.getMessage()),
                HttpStatus.NOT_FOUND
        );
    }


}
