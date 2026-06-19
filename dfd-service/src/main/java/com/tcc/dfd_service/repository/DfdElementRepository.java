package com.tcc.dfd_service.repository;

import com.tcc.dfd_service.entity.DfdElement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DfdElementRepository extends JpaRepository<DfdElement, Long> {

    List<DfdElement> findByDfdId(Long dfdId);

    Optional<DfdElement> findByUuidIdentifier(String uuidIdentifier);
}