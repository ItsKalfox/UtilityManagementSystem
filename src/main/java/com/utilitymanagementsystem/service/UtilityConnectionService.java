package com.utilitymanagementsystem.service;

import com.utilitymanagementsystem.model.UtilityConnection;
import com.utilitymanagementsystem.repository.UtilityConnectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UtilityConnectionService {

    private final UtilityConnectionRepository repository;

    @Autowired
    public UtilityConnectionService(UtilityConnectionRepository repository) {
        this.repository = repository;
    }

    public List<UtilityConnection> getAllConnections() {
        return repository.findAll();
    }

    public Optional<UtilityConnection> getConnectionById(Integer id) {
        return repository.findById(id);
    }

    public UtilityConnection saveConnection(UtilityConnection connection) {
        return repository.save(connection);
    }

    public void deleteConnection(Integer id) {
        repository.deleteById(id);
    }

    public List<UtilityConnection> getConnectionsByStatus(String status) {
        return repository.findByStatus(status);
    }

    public List<UtilityConnection> searchConnections(String searchTerm) {
        return repository.findByMeterSerialNumberContainingIgnoreCase(searchTerm);
    }

    public List<UtilityConnection> getConnectionsByUtilityTypeAndStatus(String utilityType, String status) {
        return repository.findByUtilityTypeAndStatus(utilityType, status);
    }
}