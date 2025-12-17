package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.user.UserCreateDTO;
import com.utilitymanagementsystem.dto.user.UserDetailDTO;
import com.utilitymanagementsystem.dto.user.UserListDTO;
import com.utilitymanagementsystem.dto.user.UserUpdateDTO;
import com.utilitymanagementsystem.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PreAuthorize("hasAuthority('READ_CUSTOMER')")
    @GetMapping
    public Page<UserListDTO> listCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String profile,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "userId") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return userService.getUsers(
                search, profile, status,
                page, size,
                sortBy, direction
        );
    }
    @PreAuthorize("hasAuthority('READ_CUSTOMER')")
    @GetMapping("/{id}")
    public UserDetailDTO getUser(@PathVariable Integer id) {
        return userService.getUserDetails(id);
    }

    @PreAuthorize("hasAuthority('UPDATE_CUSTOMER')")
    @PatchMapping("/{id}")
    public UserDetailDTO updateUser(
            @PathVariable Integer id,
            @Valid @RequestBody UserUpdateDTO request
    ) {
        return userService.updateUser(id, request);
    }

    @PreAuthorize("hasAuthority('CREATE_CUSTOMER')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDetailDTO createUser(@Valid @RequestBody UserCreateDTO dto) {
        return userService.createUser(dto);
    }

    @PreAuthorize("hasAuthority('DELETE_CUSTOMER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
