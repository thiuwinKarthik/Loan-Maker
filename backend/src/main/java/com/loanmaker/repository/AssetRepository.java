package com.loanmaker.repository;

import com.loanmaker.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    // Fetch all assets of a specific user
    List<Asset> findByUserId(Long userId);
}
