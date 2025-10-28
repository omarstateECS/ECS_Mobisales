const Authority = require('../models/authority');
const { getLocalTimestamp } = require('../lib/dateUtils');

class AuthorityService {
  static async createAuthority(authorityData) {
    try {
      // Validate required fields
      if (!authorityData.name || !authorityData.type) {
        throw new Error('Name and type are required');
      }

      // Validate authority type
      if (!['WEB', 'MOBILE'].includes(authorityData.type)) {
        throw new Error('Type must be either WEB or MOBILE');
      }

      const timestamp = getLocalTimestamp();
      const authority = await Authority.create({
        ...authorityData,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      return authority;
    } catch (error) {
      throw error;
    }
  }

  static async getAllAuthorities() {
    try {
      const authorities = await Authority.findAll();
      return authorities;
    } catch (error) {
      throw error;
    }
  }

  static async getAuthorityById(id) {
    try {
      if (!id) {
        throw new Error('Authority ID is required');
      }

      const authority = await Authority.findById(id);
      if (!authority) {
        throw new Error('Authority not found');
      }

      return authority;
    } catch (error) {
      throw error;
    }
  }

  static async updateAuthority(id, authorityData) {
    try {
      if (!id) {
        throw new Error('Authority ID is required');
      }

      // Validate authority type if provided
      if (authorityData.type && !['WEB', 'MOBILE'].includes(authorityData.type)) {
        throw new Error('Type must be either WEB or MOBILE');
      }

      const authority = await Authority.update(id, authorityData);
      return authority;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAuthority(id) {
    try {
      if (!id) {
        throw new Error('Authority ID is required');
      }

      const authority = await Authority.delete(id);
      return authority;
    } catch (error) {
      throw error;
    }
  }

  static async getAuthoritiesByType(type) {
    try {
      if (!type || !['WEB', 'MOBILE'].includes(type)) {
        throw new Error('Valid type (WEB or MOBILE) is required');
      }

      const authorities = await Authority.findByType(type);
      return authorities;
    } catch (error) {
      throw error;
    }
  }

  static async getAuthoritiesWithSalesmen() {
    try {
      const authorities = await Authority.getAuthoritiesWithSalesmen();
      return authorities;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthorityService;
