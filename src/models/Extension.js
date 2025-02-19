import prisma from '../config/prismaClient.js'

class ExtensionModel {
  
  static async createExtension(data) {
    try {
      return await prisma.extension.create({ data });
    } catch (error) {
      console.error('Erro ao criar extensão:', error);
      throw new Error('Não foi possível criar a extensão');
    }
  }

  // Obter todas as extensões com os dados do domínio associado
  static async getAllExtensions() {
    try {
      return await prisma.extension.findMany({
        include: { 
          domain: true,  // Inclui os dados do domínio relacionado
        },
      });
    } catch (error) {
      console.error('Erro ao buscar extensões:', error);
      throw new Error('Não foi possível recuperar as extensões');
    }
  }

  // Buscar uma extensão por ID
  static async getExtensionById(extId) {
    try {
      return await prisma.extension.findUnique({
        where: { extId: extId },  // Usando extId em vez de id
        include: { domain: true },  // Incluindo o domínio
      });
    } catch (error) {
      console.error('Erro ao buscar extensão por ID:', error);
      throw new Error('Não foi possível encontrar a extensão');
    }
  }
  

  // Buscar extensões por domínio
  static async getExtensionsByDomain(domainId) {
    try {
      return await prisma.extension.findMany({
        where: { domainId: domainId },
        include: { domain: true },  // Inclui os dados do domínio relacionado
      });
    } catch (error) {
      console.error('Erro ao buscar extensões para o domínio:', error);
      throw new Error('Não foi possível encontrar as extensões para este domínio');
    }
  }

  // Atualizar uma extensão
  static async updateExtension(extId, data) {
    try {
      return await prisma.extension.update({
        where: { id: extId },
        data,
      });
    } catch (error) {
      console.error('Erro ao atualizar extensão:', error);
      throw new Error('Não foi possível atualizar a extensão');
    }
  }

  // Deletar uma extensão
  static async deleteExtension(extId) {
    try {
      return await prisma.extension.delete({
        where: { id: extId },
      });
    } catch (error) {
      console.error('Erro ao deletar extensão:', error);
      throw new Error('Não foi possível deletar a extensão');
    }
  }
}

export default ExtensionModel;