import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db/database';

const JWT_SECRET = process.env.JWT_SECRET || 'mziv-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    plan: string;
  };
  token: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('משתמש עם אימייל זה כבר קיים');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
      },
    });

    const token = this.generateToken(user.id);

    await this.logAction(user.id, 'register', 'user', user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('אימייל או סיסמה שגויים');
    }

    const validPassword = await bcrypt.compare(input.password, user.password);

    if (!validPassword) {
      throw new Error('אימייל או סיסמה שגויים');
    }

    const token = this.generateToken(user.id);

    await this.logAction(user.id, 'login', 'user', user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
      token,
    };
  }

  async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        socialAccounts: true,
      },
    });

    if (!user) {
      throw new Error('משתמש לא נמצא');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
      brandName: user.brandName,
      brandTone: user.brandTone,
      brandColors: user.brandColors ? JSON.parse(user.brandColors) : [],
      brandLogo: user.brandLogo,
      socialAccounts: user.socialAccounts.map((acc) => ({
        id: acc.id,
        platform: acc.platform,
        accountName: acc.accountName,
        isActive: acc.isActive,
      })),
    };
  }

  async updateUser(userId: string, data: any) {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.brandName) updateData.brandName = data.brandName;
    if (data.brandTone) updateData.brandTone = data.brandTone;
    if (data.brandColors) updateData.brandColors = JSON.stringify(data.brandColors);
    if (data.brandLogo) updateData.brandLogo = data.brandLogo;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await this.logAction(userId, 'update_profile', 'user', userId);

    return user;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('משתמש לא נמצא');
    }

    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      throw new Error('סיסמה נוכחית שגויה');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await this.logAction(userId, 'change_password', 'user', userId);

    return { success: true };
  }

  async upgradePlan(userId: string, plan: 'pro' | 'enterprise') {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        planExpiresAt: expiresAt,
      },
    });

    await this.logAction(userId, 'upgrade_plan', 'user', userId, { plan });

    return {
      plan: user.plan,
      expiresAt: user.planExpiresAt,
    };
  }

  verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded;
    } catch {
      throw new Error('טוקן לא תקין');
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  private async logAction(
    userId: string,
    action: string,
    resource?: string,
    resourceId?: string,
    details?: any
  ) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details: details ? JSON.stringify(details) : null,
      },
    });
  }
}

export const authService = new AuthService();
