# Auditoria rigorosa — Vênus Beach House

**Data:** 18/09/2026  
**Escopo:** aplicação Android, backend, reservas, registros financeiros, documentos, privacidade, cadeia de build e integração do Guia Vênus PB.  
**Critério:** revisão de código e arquitetura com postura de pré-produção. Para a camada web/API foi usado como referência o OWASP ASVS 5.0; para Android, OWASP MASVS e orientações oficiais Android; para privacidade, materiais orientativos da ANPD.

> Esta auditoria não é parecer jurídico, contábil, bancário nem pentest independente. Ela identifica riscos técnicos e de negócio observáveis no repositório e implementa controles que podem ser aplicados sem credenciais externas.

## Resumo executivo

O repositório, na revisão inicial, **não deveria receber pagamentos reais nem ser apresentado como sistema operacional pronto**. O motivo principal não era apenas ausência de integrações: a migração para Android removeu a camada web/servidor que continha os controles de reserva e pagamento, mas deixou testes e documentação apontando para esses arquivos. Ao mesmo tempo, o Android atual dependia de um `HouseData.kt` inexistente e exibia valores, avaliações e confirmações simuladas localmente.

A atualização desta auditoria reorganiza a solução em três blocos:

1. **Android para o hóspede**, sem cálculo financeiro local e sem afirmações fictícias;
2. **API/painel administrativo**, responsável por preço, disponibilidade, termo, conciliação de pagamentos e trilha de auditoria;
3. **Guia Vênus PB integrado**, sincronizado do repositório `guia_lugares_pb`, com cache e opção de download.

## Achados críticos da revisão inicial

### CRIT-01 — Camada financeira removida, testes e documentação órfãos

O histórico mostra que a revisão anterior completa possuía `server/`, frontend web e lógica de reservas. A refatoração de 17/09/2026 removeu essa pilha, porém `tests/reservations.test.js` e documentos continuaram importando/explicando `server/db.js`, `server/app.js`, `server/domain.js`, SQLite, API e comandos Node.

**Impacto:** o repositório não representava uma aplicação coerente; os controles de pagamento descritos não existiam na versão atual.

**Tratamento:** backend reintroduzido em arquitetura menor e mais auditável, usando Node + `node:sqlite`, sem dependências NPM de runtime.

### CRIT-02 — Android não compilável por dependência ausente

A aplicação importava `com.aistudio.venusbeachhouse.data.HouseData`, mas o arquivo não existia na árvore atual.

**Impacto:** falha de build e impossibilidade de validar o APK a partir do repositório.

**Tratamento:** `HouseData.kt` recriado apenas com dados editoriais. Valores financeiros foram deliberadamente excluídos desse arquivo.

### CRIT-03 — Valores financeiros calculados no dispositivo

O `VenusViewModel` possuía diárias e taxa de limpeza hardcoded, e o Android gerava estimativa local.

**Impacto:** preço desatualizado poderia ser apresentado como valor real; manipulação do cliente poderia alterar cálculo; a tela contradizia o princípio de o servidor ser fonte autoritativa.

**Tratamento:** cálculo financeiro removido do Android. Cotação oficial é calculada e revalidada exclusivamente no servidor, em centavos inteiros.

### CRIT-04 — Sinais falsos de confiança na interface

Foram encontrados: nota `5.0`, texto “100% dos hóspedes recomendam”, criação local de avaliação marcada como `isVerified=true` e mensagem “enviada com sucesso” sem transmissão real.

**Impacto:** risco de informação enganosa, perda de confiança e impossibilidade de distinguir dado real de demonstração.

**Tratamento:** removidos. Avaliação somente pode ser exibida quando existir dado real/moderado; contato móvel segue para canal efetivo; nenhuma confirmação de envio é inventada.

## Achados altos e controles implementados

| Achado | Risco | Controle implementado |
|---|---|---|
| Referência bancária duplicável apenas por validação de aplicação | Registro financeiro duplicado em corrida/erro | índice `UNIQUE(method, bank_reference)` no SQLite + verificação transacional |
| Auditoria antiga registrava apenas ação/recurso | baixa rastreabilidade | `request_id`, ator, detalhes mínimos e cadeia de hashes entre eventos |
| Login administrativo só com senha | tomada de conta | `scrypt` + sessão HttpOnly/SameSite + TOTP; MFA obrigatório quando `NODE_ENV=production` |
| Backup sem criptografia obrigatória | vazamento de PII/documentos | AES-256-GCM quando chave configurada; em produção a chave passa a ser obrigatória |
| Backup Android permitido | cópia indevida de estado do app | `android:allowBackup=false` e `fullBackupContent=false` |
| Tráfego claro não explicitamente proibido | regressão para HTTP | `usesCleartextTraffic=false` + Network Security Config com cleartext desabilitado |
| Release sem minificação | maior exposição de código | R8/minify e shrink resources no release |
| Debug signing customizado | configuração frágil e credencial fixa | removido; debug volta ao mecanismo padrão do Android |
| `.gradle` versionado | ruído, binários/cache no histórico | `.gitignore` reforçado e script de aplicação remove o cache do índice |
| CSP ausente no web | XSS/injeção com impacto maior | CSP, frame denial, no-sniff, HSTS em produção, Permissions Policy, COOP/CORP |
| Dados antigos sem rotina | retenção indefinida | rotina manual de retenção/anomização configurável, sem apagar reservas confirmadas/pagamentos |
| Guia externo apenas separado | UX fragmentada | módulo Android + rota web `/guia`, cache e download offline |

## Regras de negócio financeiras preservadas/endurecidas

- dinheiro armazenado como **centavos inteiros**;
- preço é calculado no servidor, nunca aceito do cliente sem revalidação;
- pedido de reserva usa **Idempotency-Key** e hash do conteúdo;
- sobreposição com período confirmado/bloqueado gera conflito;
- a disponibilidade é revalidada dentro da transação antes de confirmar;
- reserva somente é confirmada quando o termo vigente possui aprovação registrada, o PDF assinado foi validado e o sinal mínimo de 20% está conciliado;
- comprovante não confirma pagamento: `settled=true` é uma ação administrativa após conferência no banco;
- referência bancária não pode ser reutilizada;
- pagamentos/estornos não podem levar o saldo acumulado abaixo de zero nem acima do total contratado;
- exportação CSV neutraliza fórmulas para reduzir risco de CSV Injection;
- agenda ICS não exporta nome do hóspede;
- dados bancários ficam ocultos enquanto aprovação jurídica/configuração não estiverem habilitadas.

## Privacidade e LGPD — medidas técnicas

A aplicação trabalha com nome, e-mail, telefone, datas, conteúdo de mensagens, documentos assinados e registros de pagamento. A atualização aplica minimização, finalidade explícita no formulário, moderação de avaliações, retenção configurável e controle de acesso. O banco e os backups continuam exigindo proteção do ambiente de hospedagem.

A rotina `npm run privacy:retention`:

- remove mensagens antigas após o período configurado;
- remove avaliações pendentes antigas;
- anonimiza solicitações/cancelamentos antigos **somente quando não possuem pagamentos**;
- não apaga automaticamente reserva confirmada nem histórico financeiro.

O prazo real de retenção deve ser validado juridicamente/contabilmente antes de produção.

## Integração do Guia Vênus PB

O guia permanece como projeto independente e fonte editorial própria. A Casa Vênus passa a consumi-lo como módulo:

- Android: baixa a versão oficial por HTTPS, valida tamanho/título, endurece a página com CSP, grava cache privado e abre em WebView restrita;
- Android: botão “Baixar guia offline” usa seletor de documento do sistema, sem pedir permissão ampla de armazenamento;
- Web: `/guia` sincroniza a cópia oficial, mantém cache de contingência e usa CSP específica que bloqueia comunicação de scripts da página com a API financeira;
- Web: `/guia?download=1` entrega o arquivo para download.

**Risco residual:** o conteúdo do guia é atualizado a partir do GitHub e não possui pin criptográfico de versão. A origem é fixa/HTTPS e o conteúdo executa sob política restrita, mas uma cadeia de publicação formal do guia seria o próximo endurecimento.

## Production gate — bloqueios antes de dinheiro real

A publicação comercial deve permanecer bloqueada até concluir todos os itens abaixo:

- [ ] domínio definitivo com HTTPS e cabeçalhos verificados externamente;
- [ ] `ADMIN_PASSWORD_HASH` forte configurado fora do Git;
- [ ] `ADMIN_TOTP_SECRET` configurado no gerenciador de segredos e MFA testado;
- [ ] `BACKUP_ENCRYPTION_KEY` configurada fora do host e restauração testada;
- [ ] banco/volume de produção com criptografia em repouso e acesso mínimo;
- [ ] revisão jurídica da versão exata do termo e registro da aprovação;
- [ ] dados bancários reais conferidos por duas pessoas antes de habilitar cobrança;
- [ ] fluxo de reembolso e conciliação validado com transações de teste controladas;
- [ ] APK `release` compilado, assinado com keystore de produção fora do repositório e testado em aparelho real;
- [ ] `VENUS_BOOKING_URL` apontando para o domínio real da reserva segura;
- [ ] teste de restauração de backup em ambiente isolado;
- [ ] revisão de permissões do GitHub e proteção da branch `main`;
- [ ] pentest/revisão independente antes de ampliar volume financeiro.

## Riscos residuais relevantes

1. **Conciliação bancária é manual.** Isso é mais seguro do que aceitar comprovante, mas depende de disciplina operacional. Uma API bancária oficial pode ser integrada futuramente com segregação de credenciais.
2. **SQLite não é criptografado pela aplicação.** O arquivo tem permissão restrita e backups podem ser criptografados, porém produção deve usar volume/disco criptografado e acesso ao host restrito.
3. **Documento assinado é validado manualmente.** O sistema preserva hash e registro da conferência, mas não substitui validação criptográfica institucional da assinatura.
4. **Rate limiting é em memória.** É adequado para uma única instância; múltiplas réplicas exigem armazenamento compartilhado de limite.
5. **MFA depende de segredo TOTP bem protegido.** Não registrar o segredo em Git, logs ou tickets.
6. **Android ainda precisa de build CI após aplicação do patch.** O repositório atual não contém wrapper Gradle binário; o workflow usa Gradle 8.9 provisionado pelo GitHub Actions.

## Referências de segurança

- OWASP ASVS 5.0: https://owasp.org/projects/asvs
- OWASP MASVS: https://mas.owasp.org/MASVS/
- ANPD — materiais orientativos: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes
- Android — Network Security Configuration: https://developer.android.com/privacy-and-security/security-config
- Android — Auto Backup: https://developer.android.com/identity/data/autobackup
