package com.utilitymanagementsystem.dto.role;

import lombok.Data;
import java.util.List;

@Data
public class RoleRequestDTO {
    private String roleName;
    private List<Integer> permissionIds;
}