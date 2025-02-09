import prisma from '../config/prismaClient.js'

class ExtensionModel {
    static async createExtension(data) {
      return await prisma.extension.create({ data });
    }
  
    static async getAllExtensions() {
      return await prisma.extension.findMany({
        include: { 
            domain: true,
         },
      });
    }
  }
  
export default ExtensionModel;