const prisma = require('../db');
const { parseQuery } = require('../utils/queryParser');

exports.getProducts = async (req, res, next) => {
  try {
    const { skip, take, orderBy, select, where, pageNumber } = parseQuery(req.query);

    const [products, totalItems] = await Promise.all([
      prisma.product.findMany({ skip, take, orderBy, select, where, include: select ? undefined : { provider: { select: { id: true, name: true } } } }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(totalItems / take);

    res.status(200).json({
      success: true,
      data: {
        items: products,
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

exports.getProduct = async (req, res, next) => {
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

    const product = await prisma.product.findUnique({
      where: { id },
      select,
      include: select ? undefined : { provider: { select: { id: true, name: true } } }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, description, sku, stockQuantity, category, imageUrl, isActive, weight, dimensions, providerId } = req.body;
    
    if (!name || price === undefined || !providerId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name, price, and providerId are required' }
      });
    }

    const product = await prisma.product.create({
      data: { name, price: parseFloat(price), description, sku, stockQuantity: parseInt(stockQuantity || 0), category, imageUrl, isActive, weight: weight ? parseFloat(weight) : null, dimensions, providerId: parseInt(providerId) },
      include: { provider: { select: { id: true, name: true } } }
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
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

    const { name, price, description, sku, stockQuantity, category, imageUrl, isActive, weight, dimensions, providerId } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = parseFloat(price);
    if (description !== undefined) data.description = description;
    if (sku !== undefined) data.sku = sku;
    if (stockQuantity !== undefined) data.stockQuantity = parseInt(stockQuantity);
    if (category !== undefined) data.category = category;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (isActive !== undefined) data.isActive = isActive;
    if (weight !== undefined) data.weight = parseFloat(weight);
    if (dimensions !== undefined) data.dimensions = dimensions;
    if (providerId !== undefined) data.providerId = parseInt(providerId);

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { provider: { select: { id: true, name: true } } }
    });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
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

    await prisma.product.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
