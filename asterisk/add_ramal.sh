#!/bin/bash

# Acessando os parâmetros passados para o script
RAMAL=$1
SENHA=$2
DOMINIO=$3

# Arquivos de configuração do Asterisk
PJSIP_CONF="/etc/asterisk/pjsip.conf"
EXTENSIONS_CONF="/etc/asterisk/extensions.conf"

# Adicionando o ramal no pjsip.conf
echo "Adicionando o ramal PJSIP no $PJSIP_CONF..."
cat >> $PJSIP_CONF <<EOL

[$RAMAL]
type=endpoint
transport=transport-ws
context=default
disallow=all
allow=ulaw
auth=$RAMAL-auth
aors=$RAMAL-aor

[$RAMAL-auth]
type=auth
auth_type=userpass
password=$SENHA

[$RAMAL-aor]
type=aor
max_contacts=1
EOL

# Adicionando a extensão no extensions.conf
echo "Adicionando a extensão no $EXTENSIONS_CONF..."
cat >> $EXTENSIONS_CONF <<EOL

exten => $RAMAL,1,Dial(PJSIP/$RAMAL)
EOL

# Recarregar o Asterisk
echo "Recarregando o Asterisk..."
asterisk -rx "reload"

echo "Ramal PJSIP $RAMAL adicionado com sucesso!"