const Address = require('../models/Address');

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.findByUserId(req.user.id || req.user._id);
        res.json(addresses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
const createAddress = async (req, res) => {
    try {
        const address = await Address.create({
            userId: req.user.id || req.user._id,
            ...req.body
        });
        res.status(201).json(address);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = async (req, res) => {
    try {
        const address = await Address.update(req.params.id, req.user.id || req.user._id, req.body);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json(address);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const address = await Address.delete(req.params.id, req.user.id || req.user._id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json({ message: 'Address removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress
};
