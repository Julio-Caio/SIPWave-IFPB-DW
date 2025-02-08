import prisma from '../config/prismaClient.js'

class UserModel {
    static async createUser(data) {
        return await prisma.user.create({ data })
    }

    static async getAllUsers() {
        return await prisma.user.findMany();
    }

    static async emailExists(email)
    {
        return await prisma.user.findUnique({
            where: {
                email: email
            }
        })
    }
}

export default UserModel