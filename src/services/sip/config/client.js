import * as SIP from 'sip.js'

export async function verifyClient(extId, password, domain) {
    try {
        if (!extId || !password || !domain) {
            console.log('Preencha as informações necessárias!');
            return null;
        }
        const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
        const response = await fetch(`${API_BASE_URL}/api/extensions/${extId}`);
        
        if (!response.ok) {
            throw new Error('Falha ao buscar informações do ramal');
        }

        const data = await response.json();

        if (data && data.exists) {
            console.log(`Ramal ${extId} encontrado no domínio ${domain}`);
            return {
                extId: data.extId,
                password: data.password,
                uri: `sip:${data.extId}@${domain}`,
                domain: domain,
            };
        } else {
            console.log(`Ramal ${extId} não encontrado no domínio ${domain}`);
            return null;
        }
    } catch (err) {
        console.error('Erro inesperado ao verificar o cliente:', err);
        return null;
    }
}

export async function configClient(clientInfo) {
    if (!clientInfo) {
        console.log('Informações do cliente inválidas!');
        return null;
    }

    const { extId, password, uri, domain } = clientInfo;

    const config = {
        uri: uri, 
        transportOptions: {
            wsServers: ['ws://127.0.0.1:5060'], 
        },
        authorizationUser: extId, 
        password: password, 
        traceSip: true,
    };

    console.log(`Configurando SIP para ${extId} no domínio ${domain}`);
    return config;
}

export async function makeSIPCall(callerUri, calleeUri, extId, password) {
    if (!callerUri || !calleeUri || !extId || !password) {
        console.error('Informações incompletas para realizar a chamada.');
        return Promise.reject('Informações insuficientes');
    }

    const configuration = {
        uri: callerUri, 
        wsServers: ['ws://127.0.0.1:5060'],
        traceSip: true,
        authorizationUser: extId, 
        password: password, 
        register: true, // Registrar no servidor SIP
    };

    const userAgent = new UA(configuration);

    // Evento de registro bem-sucedido
    userAgent.on('registered', () => {
        console.log('Registrado com sucesso!');
    });

    // Evento de falha de registro
    userAgent.on('registrationFailed', (error) => {
        console.error('Falha ao registrar:', error); // Usando console.error para erro
    });

    // Função para originar a chamada
    return new Promise((resolve, reject) => {
        const target = `sip:${calleeUri}`;

        const session = userAgent.invite(target, {
            media: {
                constraints: {
                    audio: true,
                    video: false
                },
                render: {
                    remote: document.getElementById('remoteAudio'), 
                    local: document.getElementById('localAudio')
                }
            }
        });

        session.on('failed', (response) => {
            console.error('Falha na chamada:', response); // Usando console.error para erro
            reject('Falha na chamada');
        });

        session.on('accepted', () => {
            console.log(`Chamada iniciada com sucesso entre ${callerUri} e ${calleeUri}`);
            resolve('Chamada estabelecida');
        });

        session.on('bye', () => {
            console.log('Chamada encerrada');
            resolve('Chamada encerrada');
        });
    });
}