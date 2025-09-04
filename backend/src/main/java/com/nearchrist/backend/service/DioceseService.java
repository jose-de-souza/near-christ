package com.nearchrist.backend.service;

import com.nearchrist.backend.dto.DioceseDto;
import com.nearchrist.backend.dto.DioceseUpsertDto;
import com.nearchrist.backend.entity.Diocese;
import com.nearchrist.backend.exception.DioceseHasParishesException;
import com.nearchrist.backend.mapper.DioceseMapper;
import com.nearchrist.backend.repository.DioceseRepository;
import com.nearchrist.backend.repository.ParishRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DioceseService {

    private final DioceseRepository dioceseRepository;
    private final DioceseMapper dioceseMapper;
    private final ParishRepository parishRepository;

    public DioceseService(DioceseRepository dioceseRepository, DioceseMapper dioceseMapper, ParishRepository parishRepository) {
        this.dioceseRepository = dioceseRepository;
        this.dioceseMapper = dioceseMapper;
        this.parishRepository = parishRepository;
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
        return dioceseRepository.findById(id)
                .map(diocese -> {
                    long parishCount = parishRepository.countByDioceseDioceseId(id);
                    if (parishCount > 0) {
                        throw new DioceseHasParishesException(diocese.getDioceseName(), (int) parishCount);
                    }
                    dioceseRepository.deleteById(id);
                    return true;
                })
                .orElse(false);
    }
}