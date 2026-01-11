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

    // Get all connections
    public List<UtilityConnection> getAllConnections() {
        return repository.findAll();
    }

    // Get connection by ID
    public Optional<UtilityConnection> getConnectionById(Integer id) {
        return repository.findById(id);
    }

    // Save a new connection
    public UtilityConnection saveConnection(UtilityConnection connection) {
        return repository.save(connection);
    }

    // Delete a connection
    public void deleteConnection(Integer id) {
        repository.deleteById(id);
    }

    // Get connections by status
    public List<UtilityConnection> getConnectionsByStatus(String status) {
        return repository.findByStatus(status);
    }

    // Search connections by meter serial number (partial match)
    public List<UtilityConnection> searchConnections(String searchTerm) {
        return repository.findByMeterSerialNumberContainingIgnoreCase(searchTerm);
    }

    // Filter by utility type and status
    public List<UtilityConnection> getConnectionsByUtilityTypeAndStatus(String utilityType, String status) {
        return repository.findByUtilityTypeAndStatus(utilityType, status);
    }
}
