package wav.hmed.productscrud.service;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import wav.hmed.productscrud.model.Brand;
import wav.hmed.productscrud.repository.BrandRepository;

import java.util.List;
import java.util.Optional;

@Service
public class BrandService {

    @Autowired
    private BrandRepository brandRepository;

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Optional<Brand> getBrandById(String id) {
        return brandRepository.findById(id);
    }

    public Brand createBrand(Brand brand) {
        return brandRepository.save(brand);
    }

    public Brand updateBrand(String id, Brand brandDetails) {
        Optional<Brand> brand = brandRepository.findById(id);
        if (brand.isPresent()) {
            Brand existingBrand = brand.get();
            existingBrand.setName(brandDetails.getName());
            existingBrand.setSales(brandDetails.getSales());
            existingBrand.setCategories(brandDetails.getCategories());
            return brandRepository.save(existingBrand);
        }
        return null;
    }

    public void deleteBrand(String id) {
        brandRepository.deleteById(id);
    }
}