package com.loanmaker.service;

import com.loanmaker.model.Asset;
import com.loanmaker.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    public Asset saveAsset(Asset asset) {
        return assetRepository.save(asset);
    }

    public List<Asset> getAssetsByUser(Long userId) {
        return assetRepository.findByUserId(userId);
    }

    public void deleteAsset(Long assetId) {
        assetRepository.deleteById(assetId);
    }
}
