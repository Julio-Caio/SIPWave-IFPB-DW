import UserModel from '../models/User.js';
import DomainModel from '../models/Domain.js';
import ExtensionModel from '../models/Extension.js';
import AuthService from './authService.js';

async function resetDatabase() {
    try {
        await UserModel.deleteAll();
        await DomainModel.deleteAll();
        await ExtensionModel.deleteAll();
    } catch (err) {
        console.warn("Foi apresentado os seguintes erros nas exclusões:\n ", err);
    }
}

async function hashedPassword(password) {
    const hashedPassword = await AuthService.hashPassword(password);
    return hashedPassword;
}

async function safeCreateUser(userData) {
    try {
        const existingUser = await UserModel.emailExists(userData.email);
        if (existingUser) {
            console.warn(`⚠️ Usuário com email '${userData.email}' já existe. Pulando inserção.`);
            return;
        }
        const hashedPassword = await AuthService.hashPassword(userData.password);
        await UserModel.createUser({ ...userData, password: hashedPassword });
        console.log(`✅ Usuário '${userData.email}' criado com sucesso.`);
    } catch (error) {
        console.error("❌ Erro ao criar usuário:", error);
    }
}

async function safeCreateDomain(domainData) {
    try {
        await DomainModel.createDomain(domainData);
    } catch (error) {
        if (error.code === 'P2002') {
            console.warn(`⚠️ Domínio com ID '${domainData.id}' já existe. Pulando inserção.`);
        } else {
            console.error("❌ Erro ao criar domínio:", error);
        }
    }
}

async function safeCreateExtension(extensionData) {
    try {
        const existingExtension = await ExtensionModel.getExtensionById(extensionData.extId);
        if (existingExtension) {
            console.warn(`⚠️ Extensão com ID '${extensionData.extId}' já existe. Pulando inserção.`);
            return;
        }
        await ExtensionModel.createExtension(extensionData);
        console.log(`✅ Extensão '${extensionData.extId}' criada com sucesso.`);
    } catch (error) {
        console.error("❌ Erro ao criar extensão:", error);
    }
}

async function seedDatabase() {
    try {
        console.log("Resetando banco...");
        await resetDatabase();
        console.log("🚀 Populando o banco de dados...");

        // Dados de usuários
        const users = [
            { username: "admin", email: "admin12@example.com", password: "123456" },
            { username: "user1", email: "user1@example.com", password: "123456" },
            { username: "user2", email: "user2@example.com", password: "123456" }
        ];

        // Criação de usuários
        for (const user of users) {
            await safeCreateUser(user);
        }

        // Dados de domínios
        const domains = [
            { id: 1, address: "ifpb.local", tag: 'Some description', sipServer: "192.168.0.103", status: "Active" },
            { id: 2, address: "ifpb.edu.br", tag: 'Some description', sipServer: "192.168.0.103", status: "Active" }
        ];

        // Criação de domínios
        for (const domain of domains) {
            await safeCreateDomain(domain);
        }

        // Dados de extensões
        const extensions = [
            { extId: 1001, uri: "sip:1001@example.com", proxySipServer: "sip.proxy.com", extPasswd: "senhaSegura123", domainId: 1 },
            { extId: 1002, uri: "sip:1002@example.com", proxySipServer: "sip.proxy.com", extPasswd: "senhaSegura123", domainId: 2 }
        ];

        // Criação de extensões
        for (const extension of extensions) {
            await safeCreateExtension(extension);
        }

        console.log("✅ Banco de dados populado com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao popular o banco de dados:", error);
    }
}

export default seedDatabase;