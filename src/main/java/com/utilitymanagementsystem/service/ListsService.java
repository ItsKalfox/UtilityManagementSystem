package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.dto.lists.AreaListDTO;
import com.utilitymanagementsystem.dto.lists.RoleListDTO;
import com.utilitymanagementsystem.repository.AreaRepository;
import com.utilitymanagementsystem.repository.CustomerRepository;
import com.utilitymanagementsystem.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ListsService {

    private final AreaRepository areaRepository;
    private final RoleRepository roleRepository;

    public ListsService(AreaRepository areaRepository,
                        RoleRepository roleRepository
    ) {
        this.areaRepository = areaRepository;
        this.roleRepository = roleRepository;
    }

    public List<AreaListDTO> getAllAreas() {
        return areaRepository.findAllAreas();
    }

    public List<RoleListDTO> getAllRoles() {
        return roleRepository.findAllRoles();
    }
}