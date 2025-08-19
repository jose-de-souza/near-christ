package com.nearchrist.backend.mapper;

import com.nearchrist.backend.dto.StateDto;
import com.nearchrist.backend.dto.StateUpsertDto;
import com.nearchrist.backend.entity.State;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface StateMapper {
    StateDto toDto(State state);

    List<StateDto> toDtoList(List<State> states);

    State toEntity(StateUpsertDto dto);
}