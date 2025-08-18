package com.nearchrist.backend.mapper;

import com.nearchrist.backend.dto.DioceseDto;
import com.nearchrist.backend.dto.DioceseUpsertDto;
import com.nearchrist.backend.entity.Diocese;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DioceseMapper {

    DioceseMapper INSTANCE = Mappers.getMapper(DioceseMapper.class);

    @Mapping(target = "associatedStateAbbreviations", expression = "java(diocese.getParishes() != null ? diocese.getParishes().stream().map(p -> p.getState().getStateAbbreviation()).filter(java.util.Objects::nonNull).distinct().sorted().collect(java.util.stream.Collectors.toList()) : java.util.List.of())")
    DioceseDto toDto(Diocese diocese);

    List<DioceseDto> toDtoList(List<Diocese> dioceses);

    @Mapping(target = "dioceseId", ignore = true)
    @Mapping(target = "parishes", ignore = true)
    @Mapping(target = "adorations", ignore = true)
    @Mapping(target = "crusades", ignore = true)
    Diocese toEntity(DioceseUpsertDto dioceseUpsertDto);
}