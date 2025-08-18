package com.nearchrist.backend.service;

import com.nearchrist.backend.dto.DioceseDto;
import com.nearchrist.backend.dto.DioceseUpsertDto;
import com.nearchrist.backend.entity.Diocese;
import com.nearchrist.backend.mapper.DioceseMapper;
import com.nearchrist.backend.repository.DioceseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DioceseService {

    private final DioceseRepository dioceseRepository;
    private final DioceseMapper dioceseMapper;

    public DioceseService(DioceseRepository dioceseRepository, DioceseMapper dioceseMapper) {
        this.dioceseRepository = dioceseRepository;
        this.dioceseMapper = dioceseMapper;
    }

    @Transactional(readOnly = true)
    public List<DioceseDto> getAllDioceses() {
        return dioceseMapper.toDtoList(dioceseRepository.findAllWithParishes());
    }

    @Transactional(readOnly = true)
    public Optional<DioceseDto> getDioceseById(Long id) {
        return dioceseRepository.findByIdWithParishes(id).map(dioceseMapper::toDto);
    }

    @Transactional
    public DioceseDto createDiocese(DioceseUpsertDto dioceseDto) {
        if (dioceseDto.dioceseName() == null || dioceseDto.dioceseName().isEmpty()) {
            throw new IllegalArgumentException("Diocese name is required");
        }
        Diocese diocese = dioceseMapper.toEntity(dioceseDto);
        Diocese savedDiocese = dioceseRepository.save(diocese);
        return dioceseMapper.toDto(savedDiocese);
    }

    @Transactional
    public Optional<DioceseDto> updateDiocese(Long id, DioceseUpsertDto dioceseDto) {
        return dioceseRepository.findById(id)
                .map(existingDiocese -> {
                    if (dioceseDto.dioceseName() != null && !dioceseDto.dioceseName().isEmpty()) {
                        existingDiocese.setDioceseName(dioceseDto.dioceseName());
                    }
                    existingDiocese.setDioceseStreetNo(dioceseDto.dioceseStreetNo());
                    existingDiocese.setDioceseStreetName(dioceseDto.dioceseStreetName());
                    existingDiocese.setDioceseSuburb(dioceseDto.dioceseSuburb());
                    existingDiocese.setDiocesePostcode(dioceseDto.diocesePostcode());
                    existingDiocese.setDiocesePhone(dioceseDto.diocesePhone());
                    existingDiocese.setDioceseEmail(dioceseDto.dioceseEmail());
                    existingDiocese.setDioceseWebsite(dioceseDto.dioceseWebsite());
                    Diocese updatedDiocese = dioceseRepository.save(existingDiocese);
                    return dioceseMapper.toDto(updatedDiocese);
                });
    }

    @Transactional
    public boolean deleteDiocese(Long id) {
        if (dioceseRepository.existsById(id)) {
            try {
                dioceseRepository.deleteById(id);
                return true;
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                throw new IllegalStateException("Cannot delete diocese because it is referenced by other records");
            }
        }
        return false;
    }
}