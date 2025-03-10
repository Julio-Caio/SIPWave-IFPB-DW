import prisma from "../config/prismaClient.js";

class DomainModel {
  // Function to create a domain
  static async create(data) {
    try {
      const newDomain = await prisma.domain.create({ data });
      return newDomain;
    } catch (error) {
      console.error("Error creating domain:", error);
      throw new Error("Error creating domain.");
    }
  }

  // Function to get all domains
  static async getAll() {
    try {
      const domains = await prisma.domain.findMany();
      return domains;
    } catch (error) {
      console.error("Error retrieving domains:", error);
      throw new Error("Error retrieving domains.");
    }
  }

  // Function to find a domain by address
  static async getDomainByAddress(address) {
    try {
      const domain = await prisma.domain.findFirst({
        where: { address },
      });
      return domain;
    } catch (error) {
      console.error("Error finding domain by address:", error);
      throw new Error("Error finding domain by address.");
    }
  }

  // Function to get a specific domain by ID
  static async getDomainById(id) {
    try {
      const domain = await prisma.domain.findUnique({
        where: { id: Number(id) },
      });
      return domain;
    } catch (error) {
      console.error("Error retrieving domain:", error);
      throw new Error("Error retrieving domain.");
    }
  }

  // Function to update a domain
  static async update(id, data) {
    try {
      const updatedDomain = await prisma.domain.update({
        where: { id: Number(id) },
        data,
      });
      return updatedDomain;
    } catch (error) {
      console.error("Error updating domain:", error);
      throw new Error("Error updating domain.");
    }
  }

  // Function to delete all domains
  static async deleteAll() {
    try {
      const deletedDomains = await prisma.domain.deleteMany();
      return deletedDomains;
    } catch (error) {
      console.error("Error deleting all domains:", error);
      throw new Error("Error deleting all domains.");
    }
  }

  // Function to delete a specific domain by ID
  static async delete(id) {
    try {
      const deletedDomain = await prisma.domain.delete({
        where: { id: Number(id) },
      });
      return deletedDomain;
    } catch (error) {
      console.error("Error deleting domain:", error);
      throw new Error("Error deleting domain.");
    }
  }
}

export default DomainModel;