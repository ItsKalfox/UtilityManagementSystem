package com.utilitymanagementsystem.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntime(RuntimeException ex) {
        return new ResponseEntity<>(
                new ApiError(401, ex.getMessage()),
                HttpStatus.UNAUTHORIZED
        );
    }
}
