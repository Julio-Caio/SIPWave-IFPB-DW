import prisma from "../config/prismaClient.js";

class UserModel {
  static async createUser(data) {
    try {
      return await prisma.user.create({ data });
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }

  static async getAll() {
    try {
      return await prisma.user.findMany();
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  static async deleteAll() {
    try {
      return await prisma.user.deleteMany();
    } catch (err) {
      console.error("Erro ao deletar todos usuários...", err);
    }
  }

  static async deleteUserbyEmail() {
    try {
      return await prisma.user.delete({
        where: { email },
      });
    } catch (err) {
      console.error(`Erro ao deletar o usuário com email ${email}:`, err);
    }
  }

  static async findUserByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
        },
      });

      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      throw new Error("Falha ao buscar usuário");
    }
  }

  static async findUserById(userId) {
    return await prisma.user.findUnique({
      where: { id: Number(userId) }
    });
  };

  static async userExists(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      return user !== null;
    } catch (error) {
      console.error("Erro ao verificar existência do e-mail:", error);
      throw new Error("Falha ao verificar e-mail");
    }
  }

  static async assignExtensionToUser(userId, { extensionId }) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(userId, 10) },
        data: {
          extension: {
            connect: { id: extensionId }
          }
        }
      });
      return updatedUser;
    } catch (error) {
      console.error("Erro detectado:", error);
      throw new Error("Failed to assign extension");
    }
  }
}

export default UserModel;