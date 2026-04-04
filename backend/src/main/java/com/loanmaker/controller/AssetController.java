package com.loanmaker.controller;

import com.loanmaker.model.Asset;
import com.loanmaker.model.User;
import com.loanmaker.service.AssetService;
import com.loanmaker.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "http://localhost:5173")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/{userId}")
    public Asset addAsset(@PathVariable Long userId, @RequestBody Asset asset) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        asset.setUser(user);
        return assetService.saveAsset(asset);
    }

    @GetMapping("/{userId}")
    public List<Asset> getAssets(@PathVariable Long userId) {
        return assetService.getAssetsByUser(userId);
    }

    @DeleteMapping("/{assetId}")
    public String deleteAsset(@PathVariable Long assetId) {
        assetService.deleteAsset(assetId);
        return "Asset deleted successfully!";
    }
}
