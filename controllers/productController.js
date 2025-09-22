const productService = require('../services/productService');

class ProductController {
    async getAll(req, res) {
        try {
            const products = await productService.getAllProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const product = await productService.getProductById(req.params.id);
            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.json(product);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const newProduct = await productService.createProduct(req.body);
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const updatedProduct = await productService.updateProduct(req.params.id, req.body);
            res.json(updatedProduct);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await productService.deleteProduct(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getWithPagination(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const category = req.query.category || null;
            const searchQuery = req.query.q || null;
            
            if (page < 1 || limit < 1 || limit > 100) {
                return res.status(400).json({ 
                    error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.' 
                });
            }

            const result = await productService.getProductsWithPagination(page, limit, category, searchQuery);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getStats(req, res) {
        try {
            const stats = await productService.getProductStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ProductController();
