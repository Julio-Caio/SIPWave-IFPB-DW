import express from 'express';
import UserModel from '../models/User.js';
import DomainModel from '../models/Domain.js';
import ExtensionModel from '../models/Extension.js';
import AuthService from '../services/authService.js';
import { verifyClient } from '../services/sip/config/client.js';
import { makeSIPCall } from '../services/sip/config/client.js';

const route = express.Router();

class HTTPError extends Error {
  constructor(message, code = 400) {
    super(message);
    this.code = code;
  }
}

// Home
route.get('/', (req, res) => {
    try {
        res.sendFile('public/index.html')
    } catch (err) {
        throw new HTTPError('Error: Unable to render rage', 404)
    }
})

// Endpoints
route.get('/extensions', async (req, res, next) => {
    try {
        res.sendFile(process.cwd() + '/public/endpoints.html')
    } catch (err) {
        throw new HTTPError('Error: Unable to render rage', 404)
    }
})

route.get('/api/extensions', async (req, res, next) => {
    try {
      const extensions = await ExtensionModel.getAllExtensions();
      return res.status(200).json(extensions);
    } catch (err) {
      next(err);
    }
});

route.get('/api/extensions/:extId', async (req, res) => {
    const { extId } = req.params;
  
    try {
      const extension = await ExtensionModel.getExtensionById(Number(extId));
  
      if (!extension) {
        return res.status(404).json({ message: 'Extensão não encontrada' });
      }
  
      res.json({
        extId: extension.extId,
        extPasswd: extension.extPasswd,
        domain: extension.domain ? extension.domain.address : 'Domínio não encontrado',
      });
    } catch (error) {
      console.error('Erro ao buscar extensão por ID:', error);
      res.status(500).json({ message: 'Erro ao buscar a extensão' });
    }
  });
  

route.get('/api/extensions/domain/:domainId', async (req, res, next) => {
    const { domainId } = req.params;

    try {
        const extensions = await ExtensionModel.getExtensionsByDomain(Number(domainId));
        
        if (extensions.length === 0) {
        return res.status(404).json({ error: 'No extensions found for this domain' });
        }

        return res.status(200).json(extensions);
    } catch (err) {
        next(err);
    }
})

// Domains
route.get('/domains', (req, res) => {
    try {
        res.sendFile(process.cwd() + '/public/domain.html')
    } catch(err){
        throw new HTTPError('Error: Unable to render page', 404)
    }
})

// return domains
route.get('/api/domains', async (req, res) => {
    try {
        const domainsCreated = await DomainModel.getAllDomains();
        return res.status(200).json(domainsCreated);
    } catch (err)
    {
        throw new HTTPError('Error: Unable to return domains!')
    }
})

//contacts
route.get('/contacts', (req, res) => {
    try {
        res.sendFile(process.cwd() + '/public/contacts.html')
    } catch(err){
        throw new HTTPError('Error: Unable to render page', 404)
    }
})

//login
route.get('/login', (req, res)=> {
    try {
        res.sendFile(process.cwd() + '/public/login.html')
    } catch (err){
        throw new HTTPError('Error: Unable to render page', 500)
    }
})

//signup
route.get('/signup', (req, res)=> {
    try {
        res.sendFile(process.cwd() + '/public/signup.html')
    } catch (err){
        throw new HTTPError('Error: Unable to render page', 500)
    }
})

// Next issue: create authorization logic
route.get('/admin/dashboard', (req, res) => {
    try {
        res.sendFile(process.cwd() + '/public/dashboard.html')
    } catch(err) {
        throw new HTTPError('Error: Unable to render page', 500)
    }
})

// Create User
route.post('/api/signup', async (req, res) => {
    const { username, email, password, repeatpassword } = req.body;

    // Validate parameters
    if (!username || !email || !password || !repeatpassword) {
        throw new HTTPError('Error when passing parameters');
    }

    if (password !== repeatpassword) {
        throw new HTTPError("Passwords don't match");
    }

    try {
        let checkEmail = await UserModel.emailExists(email);
        if (checkEmail) throw new HTTPError("The email is already registered!");

        const hashedPassword = await AuthService.hashPassword(password);

        const newUser = await UserModel.createUser({
            username,
            email,
            password: hashedPassword,
        });

        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: 'Error to register user' });
    }
});

// create extensions
route.post('/api/extensions', async (req, res, next) => {
  const { extId, uri, proxySipServer, extPasswd } = req.body;

  if (!extId || !uri || !proxySipServer || !extPasswd) {
        throw new HTTPError('Error when passing parameters');
  }

  if (typeof extId !== 'number') throw new HTTPError('Extension Id must be numeric value!', 400)

  try {
    const ext = await ExtensionModel.createExtension(req.body);

    if (!ext) {
      throw new HTTPError('Unable to create Extension Line!');
    }

    return res.status(201).json(ext);

  } catch (err) {
    next(err); 
  }
});

// Novo endpoint para verificar a extensão e configurar o cliente SIP
route.post('/api/configure-client', async (req, res) => {
    const { extId, password, domain } = req.body;

    if (!extId || !domain) {
        return res.status(400).json({ error: 'É necessário fornecer o ID do ramal e o domínio' });
    }

    try {
        const clientInfo = await verifyClient(extId, password, domain);

        if (!clientInfo) {
            return res.status(404).json({ error: 'Ramal não encontrado ou dados inválidos!' });
        }

        const clientConfig = configClient(clientInfo);

        if (!clientConfig) {
            return res.status(500).json({ error: 'Erro ao configurar o cliente SIP' });
        }

        res.status(200).json({ message: 'Cliente SIP configurado com sucesso', clientConfig });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao configurar cliente SIP' });
    }
});

// Novo endpoint para iniciar chamada entre extensões
route.post('/api/call', async (req, res) => {
    const { extIdFrom, extIdTo } = req.body;

    if (!extIdFrom || !extIdTo) {
        return res.status(400).json({ error: 'É necessário fornecer os IDs das extensões' });
    }

    try {
        // Lógica para originar a chamada SIP entre as extensões
        const callResult = await makeSIPCall(extIdFrom, extIdTo);

        if (callResult.success) {
            return res.status(200).json({ message: 'Chamada iniciada com sucesso' });
        } else {
            return res.status(500).json({ error: 'Falha ao iniciar chamada' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao tentar iniciar chamada' });
    }
});

// Create domains
route.post('/api/domains', async (req, res) => {
    const { address, tag, sipServer, status } = req.body;

    if (!address || !sipServer || !status) {
        throw new HTTPError("Missing parameters!", 400);
    }

    try {
        const domainCreated = await DomainModel.createDomain(req.body);
        res.status(201).json({
            message: "Domain created successfully!",
            domain: domainCreated
        });
    } catch (error) {
        console.error(error);
        throw new HTTPError("Unable to create domain!");
    }
});

route.use((req, res, next) => {
    return res.status(404).json({ message: 'Page not found!' });
});

// Error handler
route.use((err, req, res, next) => {
    // console.error(err.message);
    console.error(err.stack);
   
    if (err instanceof HTTPError) {
      return res.status(err.code).json({ message: err.message });
    }
   
    // next(err);
    return res.status(500).json({ message: 'Something broke!' });
  });

export default route;