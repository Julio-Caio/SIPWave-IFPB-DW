import prisma from '../config/prismaClient.js';

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

    static async deleteAll()
    {
        try {
            return await prisma.user.deleteMany()
        } catch (err) {
            console.error('Erro ao deletar todos usuários...', err)
        }
    }

    static async deleteUserbyEmail()
    {
        try {  
            return await prisma.user.delete({
                where: { email }
            })
        } catch (err) {
            console.error(`Erro ao deletar o usuário com email ${email}:`, err);
        }
    }

    static async emailExists(email) {
        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });
            return user !== null;
        } catch (error) {
            console.error("Error checking email existence:", error);
            throw new Error("Failed to check email");
        }
    }

    static async assignExtensionToUser(userId, extensionId) {
        try {
            return await prisma.user.update({
                where: { id: userId },
                data: { extensionId: extensionId }
            });
        } catch (error) {
            console.error("Error assigning extension to user:", error);
            throw new Error("Failed to assign extension");
        }
    }      
}

export default UserModel;