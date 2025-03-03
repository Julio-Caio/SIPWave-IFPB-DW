import express from "express";
import UserModel from "../models/User.js";
import DomainModel from "../models/Domain.js";
import ExtensionModel from "../models/Extension.js";
import AuthService from "../services/authService.js";

const router = express.Router();

class HTTPError extends Error {
  constructor(message, code = 400) {
    super(message);
    this.code = code;
  }
}

// Utility function to handle async routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const sendFileResponse = (filePath) =>
  asyncHandler(async (req, res) => {
    res.sendFile(process.cwd() + filePath);
  });

// Static Pages
router.get("/", sendFileResponse("/public/index.html"));
router.get("/extensions", sendFileResponse("/public/endpoints.html"));
router.get("/domains", sendFileResponse("/public/domain.html"));
router.get("/contacts", sendFileResponse("/public/contacts.html"));
router.get("/login", sendFileResponse("/public/login.html"));
router.get("/signup", sendFileResponse("/public/signup.html"));
router.get("/admin/dashboard", sendFileResponse("/public/dashboard.html"));

// API Endpoints
router.get(
  "/api/extensions",
  asyncHandler(async (req, res) => {
    const extensions = await ExtensionModel.getAll();
    res.status(200).json(extensions);
  })
);

router.get(
  "/api/extensions/:extId",
  asyncHandler(async (req, res) => {
    const extension = await ExtensionModel.getExtensionById(
      Number(req.params.extId)
    );
    if (!extension)
      return res.status(404).json({ message: "Extensão não encontrada" });

    res.json({
      extId: extension.extId,
      extPasswd: extension.extPasswd,
      domain: extension.domain
        ? extension.domain.address
        : "Domínio não encontrado",
    });
  })
);

router.get(
  "/api/extensions/domain/:domainId",
  asyncHandler(async (req, res) => {
    const extensions = await ExtensionModel.getExtensionsByDomain(
      Number(req.params.domainId)
    );
    if (!extensions.length)
      return res
        .status(404)
        .json({ error: "No extensions found for this domain" });

    res.status(200).json(extensions);
  })
);

router.get(
  "/api/domains",
  asyncHandler(async (req, res) => {
    const domains = await DomainModel.getAllDomains();
    res.status(200).json(domains);
  })
);

router.post("/users", async (req, res) => {
  const { username, email, password, repeatpassword } = req.body;

  try {
    if (!username || !email || !password || !repeatpassword) {
      return res.status(400).json({ error: "Parâmetros inválidos" });
    }

    if (password !== repeatpassword) {
      return res.status(400).json({ error: "As senhas não coincidem" });
    }

    // Verificar antes de tentar criar
    const emailExists = await UserModel.emailExists(email);
    if (emailExists) {
      return res.status(409).json({ error: "O e-mail já está registrado!" });
    }

    const hashedPassword = await AuthService.hashPassword(password);

    await UserModel.createUser({ username, email, password: hashedPassword });

    return res.status(201).json({ message: "Usuário registrado com sucesso" });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "O e-mail já está cadastrado!" });
    }
    console.error("Erro durante a criação do usuário:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Create domains
router.post("/api/domains", async (req, res) => {
  const { address, tag, sipServer, status } = req.body;

  try {
    if (!address || !sipServer || !status) {
      return res.status(400).json({ error: "Parâmetros inválidos!" });
    }
    const existingDomain = await DomainModel.getDomainByAddress(address);
    if (existingDomain) {
      return res.status(409).json({ error: "Domínio já cadastrado!" });
    }

    const newDomain = await DomainModel.createDomain({
      address,
      tag,
      sipServer,
      status,
    });
    return res.status(201).json(newDomain);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Domínio já cadastrado!" });
    }
    console.error("Erro ao criar domínio:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/api/extensions", async (req, res) => {
  try {
    const { extId, uri, proxySipServer, extPasswd, domainId } = req.body;

    if (!extId || !uri || !proxySipServer || !extPasswd || !domainId) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios!" });
    }

    const exists = await ExtensionModel.extensionExists(extId, domainId);

    if (exists) {
      return res
        .status(409)
        .json({ error: "Ramal já cadastrado neste domínio!" });
    }

    // Cria a extensão
    const newExtension = await ExtensionModel.createExtension({
      extId,
      uri,
      proxySipServer,
      extPasswd,
      domainId,
    });

    return res.status(201).json({
      message: "Extensão cadastrada com sucesso!",
      extension: newExtension,
    });
  } catch (error) {
    console.error("Erro ao cadastrar extensão:", error);
    res
      .status(500)
      .json({
        error:
          "Erro ao cadastrar extensão. Verifique os dados e tente novamente!",
      });
  }
});

router.use((req, res, next) => {
  return res.status(404).json({ message: "Page not found!" });
});

// Error handler
router.use((err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof HTTPError) {
    return res.status(err.code).json({ message: err.message });
  }
  // next(err);
  return res.status(500).json({ message: "Something broke!" });
});

export default router;