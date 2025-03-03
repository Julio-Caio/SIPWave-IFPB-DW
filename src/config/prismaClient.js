import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

// Connect to db (test)
async function testConnection() {
    try {
        await prisma.$connect() 
        console.log("\nOK Database: Connected!\n")
    } catch (error) {
        console.log("\nBad Database: Not Connected..." + error)
    }
}

testConnection();

export default prisma;