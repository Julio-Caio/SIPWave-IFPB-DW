# Usar a imagem base do Debian
FROM debian:bullseye-slim

# Instalar dependências
RUN apt-get update && apt-get install -y \
    wget \
    vim \
    curl \
    gnupg \
    pkg-config \
    libedit-dev \
    build-essential \
    subversion \
    libncurses5-dev \
    libxml2-dev \
    libsqlite3-dev \
    uuid-dev \
    libjansson-dev \
    libssl-dev \
    xmlstarlet \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /usr/src

# Copiar o arquivo tar.gz para dentro do container
COPY ./asterisk/config/asterisk-22-current.tar.gz .
COPY ./asterisk/add_ramal.sh /usr/local/bin

# Extrair e compilar o Asterisk
RUN tar -xvzf asterisk-22-current.tar.gz && \
    cd asterisk-22.* && \
    contrib/scripts/get_mp3_source.sh && \
    ./configure && \
    make menuselect.makeopts && \
    menuselect/menuselect --enable CORE-SOUNDS-EN-GSM --enable MOH-OPSOUND-WAV --enable res_snmp menuselect.makeopts && \
    make && \
    make install && \
    make samples && \
    make config && \
    ldconfig

RUN mkdir -p /var/log/asterisk /var/run/asterisk /etc/asterisk /var/spool/asterisk

# Expor as portas padrão do Asterisk
EXPOSE 5060 5061 8089

# Comando para iniciar o Asterisk no modo foreground
CMD ["asterisk", "-f"]