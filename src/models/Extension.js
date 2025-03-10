import prisma from "../config/prismaClient.js";

class ExtensionModel {
  // Function to check if an extension exists by its ID and domain ID
  static async extensionExists(extId, domainId) {
    try {
      const extension = await prisma.extension.findFirst({
        where: {
          extId,
          domainId,
        },
      });
      return !!extension;
    } catch (error) {
      console.error("Error checking if the extension exists:", error);
      throw new Error("Error searching for extension in the database");
    }
  }

  // Function to create a new extension
  static async create(data) {
    try {
      return await prisma.extension.create({ data });
    } catch (error) {
      console.error("Error creating extension:", error);
      throw new Error("Unable to create the extension");
    }
  }

  // Function to get an extension by its ID
  static async getExtensionById(id) {
    try {
      const ext = await prisma.extension.findUnique({
        where: { id: Number(id) },
      });
      return ext;
    } catch (error) {
      console.error("Error retrieving extension:", error);
      throw new Error("Error retrieving extension.");
    }
  }

  // Function to get all extensions
  static async getAll() {
    try {
      return await prisma.extension.findMany({
        include: {
          domain: true,
        },
      });
    } catch (error) {
      console.error("Error retrieving extensions:", error);
      throw new Error("Unable to retrieve extensions");
    }
  }

  // Function to update an extension by ID
  static async update(id, data) {
    try {
      return await prisma.extension.update({
        where: { id: parseInt(id, 10) },
        data: data,
      });
    } catch (error) {
      console.error("Error updating extension:", error);
      throw new Error("Unable to update the extension");
    }
  }

  // Function to get extensions by domain ID
  static async getExtensionsByDomain(domainId) {
    try {
      return await prisma.extension.findMany({
        where: { domainId: domainId },
        include: { domain: true },
      });
    } catch (error) {
      console.error("Error retrieving extensions for the domain:", error);
      throw new Error("Unable to find extensions for this domain");
    }
  }

  // Function to delete an extension by ID
  static async delete(id) {
    try {
      return await prisma.extension.delete({
        where: {
          id: parseInt(id, 10),
        },
      });
    } catch (error) {
      console.error("Error deleting extension:", error);
      throw new Error("Unable to delete the extension");
    }
  }

  // Function to delete all extensions
  static async deleteAll() {
    try {
      return await prisma.extension.deleteMany();
    } catch (error) {
      console.log("Error: Unable to delete all extensions!");
    }
  }
}

export default ExtensionModel;