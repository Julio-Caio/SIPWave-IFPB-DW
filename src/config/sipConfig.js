import { exec } from "child_process";

export async function rwAsteriskConf(extension,passwd,domain) {
  try {
    // Comando para adicionar as configurações no arquivo extensions.conf dentro do container Asterisk
    const command = `docker exec asterisk add_ramal.sh ${extension} ${passwd} ${domain}`;
    // Executar o comando para adicionar configurações ao extensions.conf no container
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
    console.error("Erro ao gerar ou recarregar Asterisk:", err);
  }
}
