import { exec } from "child_process";
import ExtensionModel from "../models/Extension.js";

export async function rwAsteriskConf() {
  try {
    const extensions = await ExtensionModel.getAll();

    let config = `[general]
context=default
allowguest=no
canreinvite=no
nat=yes
srvlookup=yes
\n`;

    extensions.forEach((ext) => {
      config += `
[${ext.extId}]
type=friend
username=${ext.extId}
secret=${ext.extPasswd}
host=dynamic
context=default
disallow=all
allow=ulaw
qualify=yes
nat=yes
callerid="${ext.extId}" <${ext.extId}>
domain=${ext.domain?.name || "default-domain"}
\n`;
    });

    // Usando o comando docker exec para escrever no arquivo extensions.conf
    const command = `docker exec -i asterisk bash -c "echo \\"${config}\\" >> /etc/asterisk/extensions.conf"`;

    // Executar comando para adicionar configurações no extensions.conf
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erro ao adicionar configuração ao Asterisk: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`⚠️ stderr: ${stderr}`);
      }
      console.log(`✅ Configuração adicionada com sucesso ao extensions.conf:\n${stdout}`);

      // Recarregar o Asterisk para aplicar as novas configurações
      exec('docker exec asterisk asterisk -rx "dialplan reload"', (reloadError, reloadStdout, reloadStderr) => {
        if (reloadError) {
          console.error(`❌ Erro ao recarregar o Asterisk: ${reloadError.message}`);
          return;
        }
        if (reloadStderr) {
          console.error(`⚠️ stderr ao recarregar: ${reloadStderr}`);
        }
        console.log(`🔁 Asterisk recarregado com sucesso: ${reloadStdout}`);
      });
    });
  } catch (err) {
    console.error("Erro ao gerar sip.conf ou recarregar Asterisk:", err);
  }
}