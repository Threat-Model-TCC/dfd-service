package com.tcc.dfd_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "processes")
public class Process extends DfdElement {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dfd_child_id", nullable = false)
    private Dfd dfdChild;
}