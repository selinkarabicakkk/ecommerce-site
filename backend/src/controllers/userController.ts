import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { NotFoundError, ForbiddenError } from '../utils/errorUtils';

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        addresses: user.addresses,
        favoriteCategories: user.favoriteCategories,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { firstName, lastName, phoneNumber } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
        addresses: updatedUser.addresses,
        favoriteCategories: updatedUser.favoriteCategories,
        isEmailVerified: updatedUser.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add user address
 * @route POST /api/users/addresses
 * @access Private
 */
export const addUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { type, street, city, state, zipCode, country, isDefault } = req.body;

    // If this is the default address, unset any existing default of the same type
    if (isDefault) {
      user.addresses.forEach((address) => {
        if (address.type === type && address.isDefault) {
          address.isDefault = false;
        }
      });
    }

    user.addresses.push({
      type,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false,
    });

    await user.save();

    res.status(201).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user address
 * @route PUT /api/users/addresses/:addressId
 * @access Private
 */
export const updateUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const addressId = req.params.addressId;
    const { type, street, city, state, zipCode, country, isDefault } = req.body;

    const addressIndex = user.addresses.findIndex(
      (address) => address._id.toString() === addressId
    );

    if (addressIndex === -1) {
      throw new NotFoundError('Address not found');
    }

    // If this is the default address, unset any existing default of the same type
    if (isDefault) {
      user.addresses.forEach((address) => {
        if (address.type === type && address.isDefault && address._id.toString() !== addressId) {
          address.isDefault = false;
        }
      });
    }

    if (type) user.addresses[addressIndex].type = type;
    if (street) user.addresses[addressIndex].street = street;
    if (city) user.addresses[addressIndex].city = city;
    if (state) user.addresses[addressIndex].state = state;
    if (zipCode) user.addresses[addressIndex].zipCode = zipCode;
    if (country) user.addresses[addressIndex].country = country;
    if (isDefault !== undefined) user.addresses[addressIndex].isDefault = isDefault;

    await user.save();

    res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user address
 * @route DELETE /api/users/addresses/:addressId
 * @access Private
 */
export const deleteUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const addressId = req.params.addressId;

    const addressIndex = user.addresses.findIndex(
      (address) => address._id.toString() === addressId
    );

    if (addressIndex === -1) {
      throw new NotFoundError('Address not found');
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update favorite categories
 * @route PUT /api/users/favorite-categories
 * @access Private
 */
export const updateFavoriteCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { categoryIds } = req.body;

    user.favoriteCategories = categoryIds;
    await user.save();

    res.status(200).json({
      success: true,
      favoriteCategories: user.favoriteCategories,
    });
  } catch (error) {
    next(error);
  }
}; 