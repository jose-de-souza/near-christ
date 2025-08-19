package com.nearchrist.backend.mapper;

import com.nearchrist.backend.dto.CrusadeDto;
import com.nearchrist.backend.dto.CrusadeUpsertDto;
import com.nearchrist.backend.entity.Crusade;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CrusadeMapper {
    @Mapping(source = "state.stateId", target = "stateId")
    @Mapping(source = "state.stateAbbreviation", target = "stateAbbreviation")
    @Mapping(source = "diocese.dioceseId", target = "dioceseId")
    @Mapping(source = "diocese.dioceseName", target = "dioceseName")
    @Mapping(source = "parish.parishId", target = "parishId")
    @Mapping(source = "parish.parishName", target = "parishName")
    CrusadeDto toDto(Crusade crusade);

    List<CrusadeDto> toDtoList(List<Crusade> crusades);

    @Mapping(source = "stateId", target = "state.stateId")
    @Mapping(source = "dioceseId", target = "diocese.dioceseId")
    @Mapping(source = "parishId", target = "parish.parishId")
    Crusade toEntity(CrusadeUpsertDto dto);
}