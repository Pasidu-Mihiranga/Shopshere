// server/controllers/categoryController.js
exports.getCategories = async (req, res) => {
  try {
    const mockCategories = [
      { _id: '1', name: 'Electronics', description: 'Electronic items', isActive: true },
      { _id: '2', name: 'Clothing', description: 'Clothing items', isActive: true },
      { _id: '3', name: 'Books', description: 'Books and literature', isActive: true }
    ];

    res.status(200).json({
      success: true,
      categories: mockCategories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Get category by ID - implementation pending',
      categoryId: req.params.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message: 'Create category - implementation pending (admin only)',
      category: req.body
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Update category - implementation pending (admin only)',
      categoryId: req.params.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Delete category - implementation pending (admin only)',
      categoryId: req.params.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};