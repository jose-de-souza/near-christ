package com.nearchrist.backend.mapper;

import com.nearchrist.backend.dto.AdorationDto;
import com.nearchrist.backend.dto.AdorationUpsertDto;
import com.nearchrist.backend.entity.Adoration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AdorationMapper {
    @Mapping(source = "state.stateId", target = "stateId")
    @Mapping(source = "state.stateAbbreviation", target = "stateAbbreviation")
    @Mapping(source = "diocese.dioceseId", target = "dioceseId")
    @Mapping(source = "diocese.dioceseName", target = "dioceseName")
    @Mapping(source = "parish.parishId", target = "parishId")
    @Mapping(source = "parish.parishName", target = "parishName")
    AdorationDto toDto(Adoration adoration);

    List<AdorationDto> toDtoList(List<Adoration> adorations);

    @Mapping(source = "stateId", target = "state.stateId")
    @Mapping(source = "dioceseId", target = "diocese.dioceseId")
    @Mapping(source = "parishId", target = "parish.parishId")
    Adoration toEntity(AdorationUpsertDto dto);
}