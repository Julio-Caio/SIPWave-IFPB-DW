import prisma from '../config/prismaClient.js'

class ExtensionModel {
    static async createExtension(data) {
      return await prisma.extension.create({ data });
    }
  
    static async getExtensionsByDomain(domainId) {
      return await prisma.extension.findMany({
        where: { domainId },
      });
    }
  }
  
export default ExtensionModel;