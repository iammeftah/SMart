package wav.hmed.productscrud.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import wav.hmed.productscrud.model.Category;
import wav.hmed.productscrud.repository.CategoryRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(String id) {
        return categoryRepository.findById(id);
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(String id, Category categoryDetails) {
        Optional<Category> category = categoryRepository.findById(id);
        if (category.isPresent()) {
            Category existingCategory = category.get();
            existingCategory.setName(categoryDetails.getName());
            existingCategory.setCount(categoryDetails.getCount());
            existingCategory.setIcon(categoryDetails.getIcon());
            return categoryRepository.save(existingCategory);
        }
        return null;
    }

    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }
}