package com.tcc.dfd_service.repository;

import com.tcc.dfd_service.entity.DataStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DataStoreRepository extends JpaRepository<DataStore, Long> {
}