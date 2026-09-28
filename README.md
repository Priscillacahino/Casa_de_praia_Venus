# Vênus Beach House 🏖️

Aplicação em evolução para apoiar a futura operação da **Vênus Beach House**, em Conde-PB, reunindo experiência do hóspede, solicitação de reservas, controles administrativos e o **Guia Vênus PB**.

> **Status: pré-produção.** O código contém controles técnicos para reservas e registros financeiros, mas pagamentos reais só devem ser habilitados depois de concluir o *production gate* descrito em `docs/AUDITORIA_RIGOROSA_2026-09-18.md`.

## Dois aplicativos em um

A experiência passa a unir dois projetos sem misturar suas responsabilidades:

- **Casa Vênus:** informações da hospedagem, contato, consulta de reserva e fluxo administrativo;
- **Guia Vênus PB:** João Pessoa, Cabedelo e Conde, sincronizado do repositório `Priscillacahino/guia_lugares_pb`, com leitura dentro do aplicativo e download offline.

O guia continua independente, então pode evoluir sem duplicar manualmente dezenas de locais dentro do projeto da casa.

## Experiência mobile da casa

A interface web também funciona como uma apresentação da hospedagem em telas pequenas:

- galeria responsiva de ambientes com ampliação em modal;
- navegação horizontal por cartões no celular;
- imagens servidas pelo próprio projeto, sem CDN obrigatória;
- atalhos PWA para ambientes, reserva e Guia Vênus;
- página offline explícita para diferenciar conteúdo em cache de funções que exigem servidor;
- interface web carregada com sucesso em Windows e acessada por dispositivo móvel na mesma rede local durante a homologação.

O inventário e a curadoria das imagens ficam em `docs/INVENTARIO_IMAGENS.md`.

## Arquitetura

```text
Hóspede
 ├─ Android (Kotlin + Jetpack Compose)
 │   ├─ Casa / cômodos / praias / contato
 │   ├─ Reserva segura → portal web quando configurado
 │   └─ Guia Vênus → cache + WebView restrita + download
 │
 └─ Web/PWA
     ├─ Cotação → API (fonte autoritativa)
     ├─ Solicitação idempotente
     └─ Guia Vênus → /guia

Administração
 └─ /admin
     ├─ MFA/TOTP em produção
     ├─ tarifas e configuração
     ├─ PDF assinado + validação humana
     ├─ pagamento/estorno conciliado
     ├─ moderação de avaliações
     └─ auditoria + CSV + ICS

Backend Node 24 + SQLite
 ├─ regras de preço/disponibilidade
 ├─ transações e unicidade bancária
 ├─ compliance do termo
 ├─ trilha encadeada por hash
 ├─ backup criptografável
 └─ retenção/anomização controlada
```

## Motor de reservas V2

O projeto agora inclui um fluxo de solicitação mais próximo de operação real:

- política configurável de antecedência, duração máxima e capacidade;
- prioridade temporária de datas com expiração automática;
- fila segura para solicitações concorrentes;
- código privado de acompanhamento do hóspede, sem conta e sem token na URL;
- consulta de situação, valores recebidos e saldo;
- pagamento negociado manualmente pelo WhatsApp oficial, sem publicar dados bancários no site;
- hóspede pode informar que realizou o pagamento, mas somente a conciliação administrativa altera o valor recebido;
- histórico operacional por reserva;
- solicitação de cancelamento autenticada pelo mesmo código privado, com análise administrativa e sem estorno automático.

Detalhes: `docs/MOTOR_RESERVAS_V2_2026-09-18.md`.

## Princípios financeiros

- valores em **centavos inteiros**;
- preço calculado e revalidado no servidor;
- o Android não possui tabela de preço hardcoded;
- comprovante não equivale a pagamento recebido;
- pagamento só é registrado como liquidado depois de conferência bancária;
- referência bancária é única;
- uma reserva só pode ser confirmada após termo vigente + PDF validado + sinal mínimo conforme percentual configurado + nova checagem de conflito;
- estorno não pode tornar o saldo negativo e pagamento não pode ultrapassar o total contratado.

## Segurança incorporada

- senha administrativa com `scrypt`;
- MFA/TOTP obrigatório em produção;
- sessão administrativa HttpOnly + SameSite Strict, com duração de 2 horas;
- proteção por origem em operações de escrita;
- rate limiting para login e alterações;
- CSP, HSTS em produção, `nosniff`, bloqueio de framing e permissões de navegador restritas;
- auditoria com identificador de requisição e cadeia de hashes;
- backup AES-256-GCM quando chave configurada — obrigatório em produção;
- painel administrativo fora do cache offline e marcado para não indexação;
- dados bancários não são publicados no fluxo público; o WhatsApp funciona apenas como ponte de atendimento e o site permanece como fonte oficial do status;
- Android sem Auto Backup e sem tráfego HTTP claro;
- release Android com minificação/shrink;
- nenhuma senha, banco, backup, keystore ou `.env` deve ser versionado.

## Rodar o backend

Requer **Node.js 24+**. O backend endurecido não depende de pacotes NPM externos em runtime.

```bash
cp .env.example .env
npm run admin:password
npm run admin:totp
npm run reservation:secret
npm test
npm run lint
npm start
```

Em produção, configure os segredos no provedor — não no repositório. `RESERVATION_TOKEN_SECRET` deve ser exclusivo do acompanhamento das reservas.

Rotas:

- `/` — experiência web do hóspede
- `/admin` — painel administrativo
- `/guia` — Guia Vênus integrado
- `/guia?download=1` — download do guia
- `/api/health` — health check

## Android

O aplicativo móvel usa Kotlin + Jetpack Compose. Para o botão **Abrir reserva segura** apontar ao portal real, configure:

```properties
VENUS_BOOKING_URL=https://seu-dominio/#reserva
```

O workflow de CI usa JDK 17 + Gradle 8.9. A chave de assinatura de produção deve ficar fora do GitHub.

## Guia Vênus

Fonte oficial:

`https://github.com/Priscillacahino/guia_lugares_pb`

O módulo baixa somente por HTTPS, valida o conteúdo básico, mantém cache privado e restringe a WebView. Links externos são abertos no navegador do dispositivo.

## Auditoria e documentação

- `docs/AUDITORIA_RIGOROSA_2026-09-18.md` — achados, correções e riscos residuais
- `docs/THREAT_MODEL.md` — modelo de ameaças
- `docs/DEPLOY.md` — publicação segura e backups
- `docs/HOMOLOGACAO_V2_2.md` — roteiro de homologação e gates externos
- `docs/STATUS_V2_2_0.md` — estado consolidado da versão 2.2.0
- `docs/PRODUCTION_READINESS_2026-09-28.md` — hardening adicional e bloqueios externos restantes
- `docs/INCIDENT_RESPONSE.md` — procedimento operacional de resposta a incidentes
- `SECURITY.md` — regras de segurança do repositório
- `docs/termo-compromisso-minuta.txt` — minuta existente; continua condicionada à revisão jurídica

## Antes de operar com dinheiro real

A revisão jurídica, o domínio HTTPS, os segredos/MFA, os dados bancários, o teste de backup/restore, o APK release e os testes em dispositivo real são **bloqueios de produção**, não itens opcionais.

## Distribuição direta do Android

O aplicativo Android será distribuído pela página oficial da casa, acessada a partir do Instagram, e não pela Google Play. O fluxo exige APK release assinado, URL HTTPS e SHA-256 publicado. Consulte `docs/DISTRIBUICAO_ANDROID_DIRETA.md`.
## Ajuste v2.3.1 — galeria e consistência visual

- fotos dos ambientes Web e Android padronizadas para os mesmos arquivos canônicos;
- aliases antigos que apontavam para imagens duplicadas foram substituídos pelo conteúdo correto;
- site deixa de depender dos nomes temporários com timestamp;
- cache PWA renovado para evitar exibição de fotos antigas após atualização.

## Imagens da casa — curadoria validada

A experiência visual foi restaurada com as fotografias históricas reais já presentes no projeto original e com a imagem aprovada da área externa com rede.

Regras de governança:
- não usar imagens ilustrativas como se fossem fotos da propriedade;
- Web e Android utilizam os mesmos arquivos canônicos;
- novas fotos só entram após validação da proprietária;
- descrições de ambientes permanecem objetivas e sem detalhamento decorativo desnecessário.

## Consolidação v2.3.2

A apresentação volta a se aproximar da estrutura visual do protótipo do AI Studio, sem substituir o backend endurecido do GitHub. Permanecem:
- LGPD e minimização de dados;
- painel administrativo protegido, MFA/TOTP e sessões curtas;
- auditoria e governança;
- cálculo e revalidação de preço no servidor;
- dados bancários fora do site público;
- pagamento tratado pelo WhatsApp e confirmação somente após conciliação administrativa;
- Guia Vênus integrado ao site;
- avaliações públicas somente após estadia concluída e moderação.

O e-mail de contato continua pendente de substituição e não deve ser tratado como canal definitivo.

### Revisão final de segurança v2.3.2

- o início do fluxo de pagamento pelo WhatsApp é validado também no backend;
- termo vigente aprovado, elegibilidade da reserva e saldo pendente são verificados antes do handoff;
- avaliações públicas são renderizadas como texto, sem interpretar HTML fornecido por hóspedes;
- o aviso de pagamento continua sem equivaler a conciliação ou confirmação bancária.
