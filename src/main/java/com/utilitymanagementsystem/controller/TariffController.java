package com.utilitymanagementsystem.controller;

import com.utilitymanagementsystem.dto.tariff.TariffRequestDTO;
import com.utilitymanagementsystem.model.Tariff;
import com.utilitymanagementsystem.model.TariffSlab;
import com.utilitymanagementsystem.repository.TariffRepository;
import com.utilitymanagementsystem.repository.TariffSlabRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/tariffs")
public class TariffController {

    private final TariffRepository tariffRepository;
    private final TariffSlabRepository tariffSlabRepository;

    public TariffController(TariffRepository tariffRepository, TariffSlabRepository tariffSlabRepository) {
        this.tariffRepository = tariffRepository;
        this.tariffSlabRepository = tariffSlabRepository;
    }

    @PreAuthorize("hasAuthority('READ_TARIFFS')")
    @GetMapping
    public List<Map<String, Object>> listTariffs() {
        List<Tariff> list = tariffRepository.findAll();

        List<Map<String, Object>> out = new ArrayList<>();
        for (Tariff t : list) {
            Map<String, Object> m = new HashMap<>();
            m.put("tariff_id", t.getTariffId());
            m.put("tariff_name", t.getTariffName());
            m.put("utility_type", t.getUtilityType());
            m.put("fixed_charge", t.getFixedCharge());
            m.put("tax_percentage", t.getTaxPercentage());
            m.put("is_prorated", t.getIsProrated());
            m.put("status", t.getStatus());
            out.add(m);
        }
        return out;
    }

    @PreAuthorize("hasAuthority('READ_TARIFFS')")
    @GetMapping("/{id}")
    public Map<String, Object> getTariff(@PathVariable Integer id) {
        Tariff t = tariffRepository.findById(id).orElseThrow();

        List<TariffSlab> slabs = tariffSlabRepository
                .findByTariff_TariffIdOrderBySlabOrderAsc(id);

        Map<String, Object> res = new HashMap<>();
        res.put("tariff_id", t.getTariffId());
        res.put("tariff_name", t.getTariffName());
        res.put("tariff_description", t.getTariffDescription());
        res.put("utility_type", t.getUtilityType());
        res.put("fixed_charge", t.getFixedCharge());
        res.put("tax_percentage", t.getTaxPercentage());
        res.put("is_prorated", t.getIsProrated());
        res.put("status", t.getStatus());

        List<Map<String, Object>> slabList = new ArrayList<>();
        for (TariffSlab s : slabs) {
            Map<String, Object> sm = new HashMap<>();
            sm.put("slab_id", s.getSlabId());
            sm.put("slab_order", s.getSlabOrder());
            sm.put("start_unit", s.getStartUnit());
            sm.put("end_unit", s.getEndUnit()); // can be null
            sm.put("unit_rate", s.getUnitRate());
            slabList.add(sm);
        }
        res.put("slabs", slabList);

        return res;
    }

    @Transactional
    @PreAuthorize("hasAuthority('CREATE_TARIFFS')")
    @PostMapping
    public Map<String, Object> createTariff(@RequestBody TariffRequestDTO dto) {
        Tariff t = new Tariff();
        t.setTariffName(dto.getTariffName());
        t.setTariffDescription(dto.getTariffDescription());
        t.setIsProrated(Boolean.TRUE.equals(dto.getIsProrated()));
        t.setFixedCharge(dto.getFixedCharge());
        t.setTaxPercentage(dto.getTaxPercentage());
        t.setUtilityType(dto.getUtilityType());
        t.setStatus(dto.getStatus() == null ? "ACTIVE" : dto.getStatus());

        Tariff saved = tariffRepository.save(t);

        if (dto.getSlabs() != null) {
            for (TariffRequestDTO.TariffSlabDTO s : dto.getSlabs()) {
                TariffSlab slab = new TariffSlab();
                slab.setTariff(saved);
                slab.setSlabOrder(s.getSlabOrder());
                slab.setStartUnit(s.getStartUnit());
                slab.setEndUnit(s.getEndUnit());
                slab.setUnitRate(s.getUnitRate());
                tariffSlabRepository.save(slab);
            }
        }

        return getTariff(saved.getTariffId());
    }

    @Transactional
    @PreAuthorize("hasAuthority('UPDATE_TARIFFS')")
    @PutMapping("/{id}")
    public Map<String, Object> updateTariff(@PathVariable Integer id, @RequestBody TariffRequestDTO dto) {
        Tariff t = tariffRepository.findById(id).orElseThrow();

        t.setTariffName(dto.getTariffName());
        t.setTariffDescription(dto.getTariffDescription());
        t.setIsProrated(Boolean.TRUE.equals(dto.getIsProrated()));
        t.setFixedCharge(dto.getFixedCharge());
        t.setTaxPercentage(dto.getTaxPercentage());
        t.setUtilityType(dto.getUtilityType());
        t.setStatus(dto.getStatus() == null ? t.getStatus() : dto.getStatus());

        tariffRepository.save(t);

        tariffSlabRepository.deleteByTariff_TariffId(id);

        if (dto.getSlabs() != null) {
            for (TariffRequestDTO.TariffSlabDTO s : dto.getSlabs()) {
                TariffSlab slab = new TariffSlab();
                slab.setTariff(t);
                slab.setSlabOrder(s.getSlabOrder());
                slab.setStartUnit(s.getStartUnit());
                slab.setEndUnit(s.getEndUnit());
                slab.setUnitRate(s.getUnitRate());
                tariffSlabRepository.save(slab);
            }
        }

        return getTariff(id);
    }
}
