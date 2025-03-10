import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import bcrypt from "bcryptjs";

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(403).redirect("/403-forbidden");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).redirect("/401-unauthorized");
  }
};

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function userIsValid(email, password) {
  try {
    const user = await UserModel.findUserByEmail(email);

    if (!user) {
      return { exists: false, message: "Usuário não encontrado" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { exists: false, message: "Senha inválida" };
    }

    return { exists: true, user };
  } catch (error) {
    console.error("Erro ao verificar usuário:", error);
    throw new Error("Falha ao verificar usuário");
  }
}