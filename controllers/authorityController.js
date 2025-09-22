const AuthorityService = require('../services/authorityService');

class AuthorityController {
  static async create(req, res) {
    try {
      const { name, type } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: 'Name and type are required'
        });
      }

      const authority = await AuthorityService.createAuthority({ name, type });

      res.status(201).json({
        success: true,
        data: authority,
        message: 'Authority created successfully'
      });
    } catch (error) {
      console.error('Error creating authority:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  static async getAll(req, res) {
    try {
      const authorities = await AuthorityService.getAllAuthorities();

      res.status(200).json({
        success: true,
        data: authorities,
        message: 'Authorities retrieved successfully'
      });
    } catch (error) {
      console.error('Error retrieving authorities:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const authority = await AuthorityService.getAuthorityById(id);

      res.status(200).json({
        success: true,
        data: authority,
        message: 'Authority retrieved successfully'
      });
    } catch (error) {
      console.error('Error retrieving authority:', error);
      
      if (error.message === 'Authority not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, type } = req.body;

      const authority = await AuthorityService.updateAuthority(id, { name, type });

      res.status(200).json({
        success: true,
        data: authority,
        message: 'Authority updated successfully'
      });
    } catch (error) {
      console.error('Error updating authority:', error);
      
      if (error.message === 'Authority not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      await AuthorityService.deleteAuthority(id);

      res.status(200).json({
        success: true,
        message: 'Authority deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting authority:', error);
      
      if (error.message === 'Authority not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  static async getByType(req, res) {
    try {
      const { type } = req.params;

      const authorities = await AuthorityService.getAuthoritiesByType(type);

      res.status(200).json({
        success: true,
        data: authorities,
        message: 'Authorities retrieved successfully'
      });
    } catch (error) {
      console.error('Error retrieving authorities by type:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  static async getWithSalesmen(req, res) {
    try {
      const authorities = await AuthorityService.getAuthoritiesWithSalesmen();

      res.status(200).json({
        success: true,
        data: authorities,
        message: 'Authorities with salesmen retrieved successfully'
      });
    } catch (error) {
      console.error('Error retrieving authorities with salesmen:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
}

module.exports = AuthorityController;
