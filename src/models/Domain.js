import prisma from '../config/prismaClient.js'

class DomainModel {
    static async createDomain(data) {
      return await prisma.domain.create({ data });
    }
  
    static async getAllDomains() {
      return await prisma.domain.findMany();
    }
  }
  
export default DomainModel;