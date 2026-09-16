# Vênus Beach House

### Plataforma de apresentação da casa e gestão de reservas

A Vênus Beach House reúne a apresentação da propriedade, a consulta de disponibilidade e a organização da hospedagem em uma aplicação acessível pelo computador e pelo celular. O projeto conecta a experiência do hóspede a um painel administrativo com agenda, tarifas, documentos e registros financeiros.

O objetivo é reduzir informações dispersas e permitir que cada pedido seja acompanhado pelo seu protocolo, desde a solicitação até a confirmação.

**Tecnologias:** React · TypeScript · Vite · Tailwind CSS · Node.js · Express · SQLite · PWA

[Funcionalidades](#funcionalidades) · [Reservas](#como-a-reserva-é-confirmada) · [Instalação](#executar-no-computador) · [Documentação](#documentação) · [Próximos passos](#próximos-passos)

> **Estado do projeto:** implementação disponível para configuração e testes de implantação. O termo de compromisso permanece desativado até aprovação jurídica. Os dados bancários começam em branco e as tarifas precisam ser cadastradas antes de habilitar pedidos.

## Proposta do projeto

Para o hóspede, a plataforma oferece informações sobre a casa, fotos, comodidades, localização e um caminho para solicitar a estadia.

Para a administração, concentra os pedidos, os valores combinados, o termo assinado e os pagamentos registrados. A confirmação depende de requisitos verificados no servidor, além da conferência da disponibilidade.

O banco inicial não contém reservas, tarifas ou avaliações fictícias. As fotos e informações da propriedade presentes no projeto devem ser conferidas pela responsável antes da publicação.

## Funcionalidades

| Área | Recursos implementados |
| --- | --- |
| Apresentação da casa | Galeria de fotos, ambientes, comodidades, informações sobre praias e localização. |
| Pedidos de reserva | Seleção de datas, orçamento, identificação do hóspede e protocolo; proteção contra reenvio duplicado. |
| Agenda | Consulta de disponibilidade, pedidos pendentes, confirmações, cancelamentos e bloqueios manuais. |
| Tarifas | Valores por período, distinção entre sexta/sábado e demais dias, mínimo de noites e taxa única de limpeza. |
| Termo de compromisso | Minuta para revisão, documento com dados do pedido, armazenamento do PDF assinado e registro da conferência. |
| Pagamentos | Sinal de 20%, cadastro de dados para Pix e transferência e registro manual de valores compensados. |
| Financeiro | Total contratado, valores registrados, saldo e exportação de reservas em CSV. |
| Atendimento | Mensagens recebidas no painel e abertura de conversa no WhatsApp com resumo do pedido. |
| Avaliações | Envio de comentários e publicação após moderação administrativa. |
| Celular | Interface responsiva, manifesto de instalação e página de orientação quando não há conexão. |

### Como a reserva é confirmada

**Solicitar uma reserva não garante as datas.** Pedidos pendentes podem coincidir; somente reservas confirmadas e bloqueios ocupam a agenda.

1. O hóspede informa o período e envia o pedido.
2. O sistema registra o protocolo e o orçamento.
3. Após a aprovação jurídica do modelo, a administração prepara o termo individual com todas as informações necessárias.
4. O hóspede assina o documento; a administração recebe o PDF original e verifica assinatura, identidade e conteúdo.
5. A administração confere no banco o recebimento do sinal de **20% do total** e registra a movimentação.
6. Ao confirmar, o servidor exige os requisitos abaixo e verifica novamente possíveis conflitos de datas.

| Requisito | Condição para confirmação |
| --- | --- |
| Aprovação jurídica | Registrada para a versão atual do modelo. |
| Termo assinado | PDF anexado e conferência registrada para o documento atual. |
| Sinal recebido | Pelo menos 20% do total, considerando os pagamentos marcados como compensados. |
| Disponibilidade | Ausência de reserva confirmada ou bloqueio conflitante. |

A confirmação final é uma ação da administração. O envio de um comprovante pelo hóspede não comprova, por si só, a entrada do dinheiro na conta. A noite do check-out não é ocupada nem cobrada.

## Termo de compromisso e cancelamento

O repositório inclui uma **minuta para revisão jurídica**, em Word e texto. A assinatura eletrônica, como a realizada pelo gov.br, ocorre fora da aplicação. O painel permite guardar o PDF original e registrar a conferência feita pela administração, com referência ao relatório de validação.

**O sistema não realiza verificação criptográfica automática e não substitui a análise jurídica do conteúdo.** Substituir o PDF anexado exige nova conferência. Alterar o texto do modelo exige aprovação da nova versão.

A política proposta, ainda sujeita à revisão jurídica, considera a antecedência até o horário de check-in:

| Comunicação do cancelamento | Devolução proposta sobre o sinal efetivamente pago |
| --- | --- |
| 48 horas ou mais | 100% |
| De 24 horas até menos de 48 horas | 50% |
| Menos de 24 horas | 0% |

As exceções legais e as condições de restituição integral descritas na minuta prevalecem sobre essa tabela. Cancelamentos e devoluções não movimentam dinheiro automaticamente.

- [Minuta editável em Word](docs/termo-compromisso-minuta.docx)
- [Texto do modelo utilizado pelo sistema](docs/termo-compromisso-minuta.txt)
- [Orientações para aprovação e operação](docs/ATUALIZACAO-2026-09-16.md)

Alterar apenas o Word não atualiza o modelo utilizado pela aplicação.

## Pagamentos e integrações

| Recurso | Funcionamento atual | Evolução ainda necessária |
| --- | --- | --- |
| Pix e transferência | Dados bancários configuráveis e registro do recebimento conferido no extrato. | Cobrança dinâmica, QR Code e conciliação automática com provedor bancário. |
| Assinatura eletrônica | Assinatura externa e registro da conferência humana do PDF original. | Integração com serviço de assinatura e validação automatizada. |
| WhatsApp | Link que abre uma conversa com informações do pedido. | Automação pela API Business. |
| Google Maps | Link da propriedade e campo para mapa incorporado. | Conferência do endereço e configuração da incorporação. |
| Google Agenda | Exportação de arquivo ICS para importação manual. | Sincronização entre calendários. |
| Planilha financeira | Exportação CSV com valores calculados a partir do banco. | Despesas, indicadores de resultado e conciliação contábil. |

Os dados bancários começam vazios. As opções públicas de pagamento dependem do cadastro dos dados necessários e da aprovação jurídica registrada. Esta versão não consulta a conta Nubank nem processa cartões.

## Aplicativo para celular

A versão mobile é uma **PWA**, uma aplicação web que pode ser instalada pelo navegador quando o dispositivo oferece suporte.

- Utiliza a mesma API e o mesmo banco do site.
- Pode ser acessada por Android e iPhone.
- Possui ícones, manifesto e página offline.
- Precisa de conexão para consultar disponibilidade e enviar informações.

Não há APK nem distribuição pela Google Play ou App Store nesta versão. A instalação e a usabilidade precisam ser verificadas em aparelhos reais após a publicação em HTTPS.

## Organização técnica

| Camada | Tecnologia e responsabilidade |
| --- | --- |
| Interface | React, TypeScript e Tailwind CSS para as telas públicas e administrativas. |
| Desenvolvimento e build | Vite para execução local e geração dos arquivos de produção. |
| API | Node.js 24+ e Express para autenticação, reservas e regras de negócio. |
| Persistência | SQLite no servidor, com criação do esquema e migrações na inicialização. |
| Documentos | PDFs assinados armazenados no banco, com hash SHA-256 e registros de validação. |
| Implantação | Dockerfile e execução em uma instância com disco persistente. |

### Arquivos principais

| Caminho | Conteúdo |
| --- | --- |
| `src/components/` | Telas da casa, reservas, administração e documentos. |
| `src/service.tsx` | Comunicação da interface com a API. |
| `server/app.js` | Rotas e operações da aplicação. |
| `server/domain.js` | Cálculos, datas e regras de disponibilidade. |
| `server/compliance.js` | Aprovação jurídica, documentos e requisitos de confirmação. |
| `server/db.js` | Esquema e inicialização do banco. |
| `scripts/` | Desenvolvimento, geração do hash da senha e backup. |
| `tests/` | Testes automatizados com dados isolados. |
| `public/` | Imagens e arquivos da PWA. |
| `docs/` | Minuta, orientações de atualização e implantação. |

## Executar no computador

### Pré-requisitos

- Git.
- Node.js **24 ou superior**, com npm.
- Terminal e editor de texto.

### 1. Baixar o projeto e instalar as dependências

Para uma instalação nova:

```powershell
git clone https://github.com/Priscillacahino/Casa_de_praia_Venus.git
cd Casa_de_praia_Venus
npm ci
```

Se já possui o repositório, utilize a pasta existente e atualize-a antes de continuar.

### 2. Criar a configuração local

No PowerShell, apenas se ainda não existir um arquivo `.env`:

```powershell
Copy-Item .env.example .env
npm run admin:password
```

No Linux ou macOS, o comando equivalente de cópia é `cp .env.example .env`.

O comando de senha gera um hash. Copie **somente o hash gerado** para o campo `ADMIN_PASSWORD_HASH` no arquivo `.env`. Preserve as configurações existentes ao atualizar uma instalação.

| Variável | Uso local |
| --- | --- |
| `APP_URL` | `http://localhost:3000` |
| `PORT` | `3001`, porta da API. |
| `DATABASE_PATH` | `./data/venus.sqlite` |
| `ADMIN_PASSWORD_HASH` | Hash gerado pelo comando de senha. |

Nunca publique o arquivo `.env`, senhas, documentos de hóspedes ou cópias do banco no GitHub.

### 3. Iniciar

```powershell
npm run dev
```

- Site: [localhost:3000](http://localhost:3000)
- Administração: [localhost:3000/admin](http://localhost:3000/admin)

O processo inicia a interface e a API. O banco é criado automaticamente no caminho configurado. Mantenha o terminal aberto durante o uso; para encerrar, pressione **Ctrl+C**.

## Configurar a operação

1. Confira os dados da casa, capacidade, WhatsApp, e-mail e localização.
2. Cadastre tarifas reais, mínimo de noites e limpeza.
3. Registre bloqueios para manutenção, uso próprio e reservas de outros canais.
4. Submeta a minuta ao jurídico e incorpore os ajustes no modelo usado pelo sistema.
5. Registre a aprovação somente depois de concedida para a versão final.
6. Preencha e confira os dados bancários quando estiverem disponíveis.
7. Habilite os pedidos e ensaie o fluxo completo em ambiente separado.
8. Verifique instalação mobile, backups e restauração antes de abrir a operação ao público.

O sinal é fixado em 20%. Orçamentos e pagamentos antigos exigem atenção específica na migração: consulte as [orientações de atualização](docs/ATUALIZACAO-2026-09-16.md).

## Testes e manutenção

| Comando | Finalidade |
| --- | --- |
| `npm test` | Executar testes de cálculo, API, confirmação, conflitos e backup. |
| `npm run lint` | Verificar os tipos TypeScript. |
| `npm run build` | Gerar a interface de produção. |
| `npm start` | Iniciar o servidor para servir a API e a interface já compilada. |
| `npm run backup` | Criar backup do banco configurado. |

A suíte utiliza banco isolado; os dados de teste não são inseridos na operação. Os testes abrangem recusa de confirmação sem os requisitos, pagamentos insuficientes, duplicidade de transação e invalidação da conferência quando o documento é substituído.

Testes automatizados não substituem a conferência em celular real e no ambiente de hospedagem escolhido.

### Cuidados com os dados

O projeto utiliza sessões administrativas com cookie HttpOnly, derivação de senha com scrypt, controle de origem nas operações de escrita, limitação de requisições e registros de auditoria. Os documentos assinados ficam em rotas administrativas.

O service worker não armazena respostas da API ou documentos privados para uso offline. Backups devem ter acesso restrito e cópia externa; a restauração precisa ser ensaiada.

## Publicar o site

A aplicação exige **Node.js 24+, HTTPS, uma instância e armazenamento persistente** para o SQLite e seus documentos.

Enviar arquivos ao GitHub não publica a aplicação. Hospedar somente a pasta `dist` não disponibiliza a API e o banco. GitHub Pages sozinho não atende a essa arquitetura.

Para usar funções efêmeras ou múltiplas instâncias, é necessário adaptar a persistência, por exemplo para um banco gerenciado. Consulte o [guia de implantação](docs/DEPLOY.md) antes de escolher a hospedagem.

## Próximos passos

- [ ] Concluir a revisão jurídica e preencher as informações definitivas do contrato.
- [ ] Cadastrar dados bancários e parâmetros reais da operação.
- [ ] Implantar em ambiente com HTTPS e disco persistente.
- [ ] Testar o percurso completo do hóspede e da administração em aparelhos reais.
- [ ] Validar backup e restauração no ambiente escolhido.
- [ ] Avaliar integração bancária para cobrança e conciliação automática.
- [ ] Avaliar assinatura e validação eletrônica integradas.
- [ ] Avaliar sincronização de calendário e automações de atendimento.

Reservas de Airbnb, Booking.com ou outros canais precisam ser bloqueadas manualmente. A exportação financeira não calcula lucro nem substitui a contabilidade.

## Documentação

- [Implantação e operação](docs/DEPLOY.md)
- [Atualização e fluxo de termo e pagamentos](docs/ATUALIZACAO-2026-09-16.md)
- [Termo de compromisso em Word](docs/termo-compromisso-minuta.docx)
- [Modelo de termo em texto](docs/termo-compromisso-minuta.txt)

## Responsável pelo projeto

**Priscilla Cahino** · [Perfil no GitHub](https://github.com/Priscillacahino)

Projeto em evolução, desenvolvido com apoio de ferramentas de inteligência artificial. A liberação para uso real depende da configuração operacional, da revisão jurídica e da validação no ambiente de implantação.
