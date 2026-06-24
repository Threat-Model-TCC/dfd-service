package com.tcc.dfd_service.repository;

import com.tcc.dfd_service.entity.DataFlow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DataFlowRepository extends JpaRepository<DataFlow, Long> {

    @Query("SELECT df FROM DataFlow df WHERE df.dfdId = :dfdId")
    List<DataFlow> findByDfdId(Long dfdId);
}