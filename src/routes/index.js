import express from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import UserModel from "../models/User.js";
import DomainModel from "../models/Domain.js";
import ExtensionModel from "../models/Extension.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import {
  hashPassword,
  isAuthenticated,
  userIsValid,
} from "../middleware/auth.js";
import dotenv from "dotenv";
//import { generateSipConfFile } from "../config/sipConfig.js";

dotenv.config();

const router = express.Router();

class HTTPError extends Error {
  constructor(message, code = 400) {
    super(message);
    this.code = code;
  }
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});

router.use(limiter);
router.use(cookieParser());

// Utility function to handle async routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware - validate user input
const validateUserInput = [
  body("username").trim().escape().isLength({ min: 3 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
];

// Utility function to send file responses
const sendFileResponse = (filePath) =>
  asyncHandler(async (req, res) => {
    res.sendFile(process.cwd() + filePath);
  });

// Public Static Pages
router.get("/", sendFileResponse("/public/index.html"));
router.get("/login", sendFileResponse("/public/login.html"));
router.get("/signup", sendFileResponse("/public/signup.html"));
router.get("/404-not-found", sendFileResponse("/public/404.html"));
router.get("/401-unauthorized", sendFileResponse("/public/401.html"));
router.get("/403-forbidden", sendFileResponse("/public/403.html"));

/// Signup
router.post(
  "/auth/signup",
  validateUserInput,
  asyncHandler(async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { username, email, password, repeatpassword } = req.body;

      if (password !== repeatpassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }
      // Check if email is already registered
      const emailExists = await UserModel.findUserByEmail(email);

      if (emailExists) {
        return res.status(409).json({ error: "Email is already registered!" });
      }
      // Encrypt the password
      const hashedPassword = await hashPassword(password);

      // Create the user in the database
      await UserModel.createUser({ username, email, password: hashedPassword });

      return res.status(201).json({ message: "User successfully registered" });
    } catch (error) {
      // Check for duplication error (for Prisma)
      if (error.code === "P2002") {
        return res.status(409).json({ error: "Email is already registered!" });
      }
      console.error("Error during user creation:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Login
router.post("/auth/signin", validateUserInput, async (req, res) => {
  const { email, password } = req.body;

  try {
    const validUser = await userIsValid(email, password);

    if (!validUser.exists) {
      res.status(401).json({ message: "Incorrect username or password" });
    }

    console.log(process.env.JWT_SECRET);

    const token = jwt.sign(
      { userId: validUser.user.id, email: validUser.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "Strict",
    });

    res.status(200).redirect("/domains");
  } catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", function (req, res) {
  res.clearCookie("token");
  res.json({ auth: false, token: null });
});

// Route for extensions
router.get("/extensions", isAuthenticated, async (req, res) => {
  res.sendFile(process.cwd() + "/public/endpoints.html");
});

// Route for domains
router.get("/domains", isAuthenticated, async (req, res) => {
  res.sendFile(process.cwd() + "/public/domain.html");
});

// Route for dashboard
router.get("/dashboard", isAuthenticated, async (req, res) => {
  res.sendFile(process.cwd() + "/public/dashboard.html");
});

// 🔹 List all extensions
router.get(
  "/api/extensions",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const extensions = await ExtensionModel.getAll();
    res.status(200).json(extensions);
  })
);

// 🔹 Get extension by ID
router.get(
  "/api/extensions/:extId",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const extension = await ExtensionModel.getExtensionById(
      Number(req.params.extId)
    );

    if (!extension) {
      return res.status(404).json({ message: "Extension not found" });
    }

    res.json({
      extId: extension.extId,
      extPasswd: extension.extPasswd,
      domain: extension.domain ? extension.domain.address : "Domain not found",
    });
  })
);

// 🔹 Create extension
router.post(
  "/api/extensions",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { extId, uri, domain, proxySipServer, extPasswd } = req.body;
    try {
      const numeric_extId = parseInt(extId, 10);
      const numeric_domain = parseInt(domain, 10);

      if (isNaN(numeric_extId) && isNaN(numeric_domain)) {
        return res.status(400).json({ error: "Invalid values!" });
      }
      const existingExt = await ExtensionModel.extensionExists(
        numeric_extId,
        numeric_domain
      );

      if (existingExt) {
        return res.status(409).json({ error: "Extension already registered!" });
      } else {
        const newExtension = await ExtensionModel.create({
          extId: numeric_extId,
          uri,
          proxySipServer,
          extPasswd,
          domainId: numeric_domain,
        });
        // Cadastrar o novo ramal no arquivo conf do Asterisk
        await generateSipConfFile();

        res.status(201).json(newExtension);
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal server error", error });
    }
  })
);

// Update extension
router.put(
  "/api/extensions/:id",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { extId, uri, domain, proxySipServer, extPasswd } = req.body;

    const numeric_extId = parseInt(extId, 10);
    const numeric_domain = parseInt(domain, 10);

    if (isNaN(numeric_extId)) {
      return res.status(400).json({ error: "Invalid extId!" });
    }

    if (isNaN(numeric_domain)) {
      return res.status(400).json({ error: "Invalid domain!" });
    }

    const existingExt = await ExtensionModel.getExtensionById(parseInt(id, 10));
    if (!existingExt) {
      return res.status(404).json({ error: "Extension not found!" });
    }

    const updateData = {
      uri,
      proxySipServer,
      extPasswd,
      extId: numeric_extId,
      domainId: numeric_domain,
    };

    const updatedExt = await ExtensionModel.update(id, updateData);
    res.status(200).json(updatedExt);
  })
);

// Delete extension
router.delete(
  "/api/extensions/:id",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existingExt = await ExtensionModel.getExtensionById(parseInt(id, 10));
    if (!existingExt) {
      return res.status(404).json({ error: "Extension not found!" });
    }

    await ExtensionModel.delete(id);
    res.status(200).json({ message: "Extension successfully deleted!" });
  })
);

// 🔹 List all domains
router.get(
  "/api/domains",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const domains = await DomainModel.getAll();
    res.status(200).json(domains);
  })
);

// Create domain
router.post(
  "/api/domains",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { address, tag, sipServer, status } = req.body;
    if (!address || !sipServer || !status) {
      return res.status(400).json({ error: "Invalid parameters!" });
    }

    const existingDomain = await DomainModel.getDomainByAddress(address);
    if (existingDomain) {
      return res.status(409).json({ error: "Domain already registered!" });
    }

    const newDomain = await DomainModel.create({
      address,
      tag,
      sipServer,
      status,
    });
    res.status(201).json(newDomain);
  })
);

// Update domain
router.put(
  "/api/domains/:id",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { address, tag, sipServer, status } = req.body;

    if (!address || !sipServer || !status) {
      return res.status(400).json({ error: "Invalid parameters!" });
    }

    const existingDomain = await DomainModel.getDomainById(id);
    if (!existingDomain) {
      return res.status(404).json({ error: "Domain not found!" });
    }

    const updatedDomain = await DomainModel.update(id, {
      address,
      tag,
      sipServer,
      status,
    });

    res.status(200).json(updatedDomain);
  })
);

// Delete domain
router.delete(
  "/api/domains/:id",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const existingDomain = await DomainModel.getDomainById(id);
      if (!existingDomain) return res.redirect("/404-not-found");

      const deleted = await DomainModel.delete(id);
      res.status(200).json(deleted);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error!" });
    }
  })
);

router.use((req, res) => {
  res.status(404).send("Page not found");
});

export default router;