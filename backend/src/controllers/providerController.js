const prisma = require('../db');
const { parseQuery } = require('../utils/queryParser');

exports.getProviders = async (req, res, next) => {
  try {
    const { skip, take, orderBy, select, where, pageNumber } = parseQuery(req.query);

    const [providers, totalItems] = await Promise.all([
      prisma.provider.findMany({ skip, take, orderBy, select, where }),
      prisma.provider.count({ where })
    ]);

    const totalPages = Math.ceil(totalItems / take);

    res.status(200).json({
      success: true,
      data: {
        items: providers,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalItems,
          itemsPerPage: take
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProvider = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid ID parameter. ID must be a positive integer.'
        }
      });
    }

    const { fields } = req.query;
    let select = undefined;
    if (fields) {
      select = {};
      fields.split(',').forEach(f => select[f] = true);
    }

    const provider = await prisma.provider.findUnique({
      where: { id },
      select
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Provider not found' }
      });
    }

    res.status(200).json({ success: true, data: provider });
  } catch (error) {
    next(error);
  }
};

exports.createProvider = async (req, res, next) => {
  try {
    const { name, address, phone, description, email, status } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name is required' }
      });
    }

    const provider = await prisma.provider.create({
      data: { name, address, phone, description, email, status }
    });

    res.status(201).json({ success: true, data: provider });
  } catch (error) {
    next(error);
  }
};

exports.updateProvider = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid ID parameter. ID must be a positive integer.'
        }
      });
    }

    const { name, address, phone, description, email, status } = req.body;

    const provider = await prisma.provider.update({
      where: { id },
      data: { name, address, phone, description, email, status }
    });

    res.status(200).json({ success: true, data: provider });
  } catch (error) {
    next(error);
  }
};

exports.deleteProvider = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid ID parameter. ID must be a positive integer.'
        }
      });
    }

    await prisma.provider.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
