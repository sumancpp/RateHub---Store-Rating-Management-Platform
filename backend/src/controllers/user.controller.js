import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { changePasswordSchema } from '../validators/auth.validator.js';

export async function changePassword(req, res, next) {
  try {
    const validatedData = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    const isMatch = await bcrypt.compare(validatedData.currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        status: 'fail',
        message: 'Current password does not match',
      });
    }

    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash },
    });

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
}
