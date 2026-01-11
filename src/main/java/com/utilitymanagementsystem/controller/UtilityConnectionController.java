package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.utility.UtilityConnectionDTO;
import com.utilitymanagementsystem.dto.utility.UtilityConnectionRequestDTO;
import com.utilitymanagementsystem.model.Customer;
import com.utilitymanagementsystem.model.Tariff;
import com.utilitymanagementsystem.model.UtilityConnection;
import com.utilitymanagementsystem.service.UtilityConnectionService;
import jakarta.persistence.EntityManager;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/connections")
public class UtilityConnectionController {

    private final UtilityConnectionService service;
    private final EntityManager em;

    public UtilityConnectionController(UtilityConnectionService service, EntityManager em) {
        this.service = service;
        this.em = em;
    }

    @GetMapping
    public List<UtilityConnectionDTO> getConnections() {
        return service.getAllConnections()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public UtilityConnectionDTO getConnection(@PathVariable Integer id) {
        UtilityConnection c = service.getConnectionById(id).orElseThrow();
        return toDto(c);
    }

    @PostMapping
    public UtilityConnectionDTO addConnection(@RequestBody UtilityConnectionRequestDTO req) {
        UtilityConnection c = new UtilityConnection();
        applyReq(c, req);
        UtilityConnection saved = service.saveConnection(c);
        return toDto(saved);
    }

    @PutMapping("/{id}")
    public UtilityConnectionDTO updateConnection(@PathVariable Integer id, @RequestBody UtilityConnectionRequestDTO req) {
        UtilityConnection existing = service.getConnectionById(id).orElseThrow();
        applyReq(existing, req);
        UtilityConnection saved = service.saveConnection(existing);
        return toDto(saved);
    }

    @DeleteMapping("/{id}")
    public void deleteConnection(@PathVariable Integer id) {
        service.deleteConnection(id);
    }

    private UtilityConnectionDTO toDto(UtilityConnection c) {
        return new UtilityConnectionDTO(
                c.getConnectionId(),
                c.getCustomer() != null ? c.getCustomer().getUserId() : null,
                c.getTariff() != null ? c.getTariff().getTariffId() : null,
                c.getMeterSerialNumber(),
                c.getUtilityType(),
                c.getInstallDate(),
                c.getStatus()
        );
    }

    private void applyReq(UtilityConnection c, UtilityConnectionRequestDTO req) {
        c.setMeterSerialNumber(req.meter_serial_number());
        c.setUtilityType(req.utility_type());
        c.setInstallDate(req.install_date());
        c.setStatus(req.status());

        Customer customerRef = em.getReference(Customer.class, req.customer_id());
        Tariff tariffRef = em.getReference(Tariff.class, req.tariff_id());
        c.setCustomer(customerRef);
        c.setTariff(tariffRef);
    }
}
