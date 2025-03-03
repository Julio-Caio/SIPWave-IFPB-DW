import prisma from '../config/prismaClient.js';

class DomainModel {
    static async createDomain(data) {
        return await prisma.domain.create({ data });
    }

    static async getAllDomains() {
        return await prisma.domain.findMany();
    }

    static async updateDomain(id, data) {
      return await prisma.domain.update({
          where: { id: Number(id) },
          data,
      });
  }

  static async deleteAll()
  {
      return await prisma.domain.deleteMany()
  }

  static async deleteDomain(id) {
      return await prisma.domain.delete({
          where: { id: Number(id) },
      });
  }
}

export default DomainModel;