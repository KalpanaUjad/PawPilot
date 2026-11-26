
const Pet = require("../models/Pet");

// ADD PET
exports.addPet = async (req, res) => {
  try {
    const {
      name,
      species,
      breed,
      age,
      gender,
      weight,
      notes
    } = req.body;

    if (!name || !species) {
      return res.status(400).json({
        success: false,
        message: "Pet name and species are required"
      });
    }

    const pet = await Pet.create({
      owner: req.user._id,
      name,
      species,
      breed,
      age,
      gender,
      weight,
      notes
    });

    res.status(201).json({
      success: true,
      message: "Pet added successfully",
      pet
    });
  } catch (error) {
    console.error("Add pet error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to add pet"
    });
  }
};

// GET ALL PETS OF LOGGED-IN OWNER
exports.getPets = async (req, res) => {
  try {
    const pets = await Pet.find({
      owner: req.user._id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pets.length,
      pets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch pets"
    });
  }
};

// UPDATE PET
exports.updatePet = async (req, res) => {
  try {
    const pet = await Pet.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found"
      });
    }

    res.json({
      success: true,
      message: "Pet updated successfully",
      pet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update pet"
    });
  }
};

// DELETE PET
exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found"
      });
    }

    res.json({
      success: true,
      message: "Pet deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete pet"
    });
  }
};
