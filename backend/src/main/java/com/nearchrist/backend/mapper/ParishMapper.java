package com.nearchrist.backend.mapper;

import com.nearchrist.backend.dto.ParishDto;
import com.nearchrist.backend.dto.ParishUpsertDto;
import com.nearchrist.backend.entity.Parish;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ParishMapper {
    @Mapping(source = "diocese.dioceseId", target = "dioceseId")
    @Mapping(source = "diocese.dioceseName", target = "dioceseName")
    @Mapping(source = "state.stateId", target = "stateId")
    @Mapping(source = "state.stateAbbreviation", target = "stateAbbreviation")
    ParishDto toDto(Parish parish);

    List<ParishDto> toDtoList(List<Parish> parishes);

    @Mapping(source = "dioceseId", target = "diocese.dioceseId")
    @Mapping(source = "stateId", target = "state.stateId")
    @Mapping(target = "adorations", ignore = true)
    @Mapping(target = "crusades", ignore = true)
    Parish toEntity(ParishUpsertDto dto);
}