# Vênus Beach House

Site de hospedagem e aplicativo web instalável (PWA). Interface original em React/Vite, API Express e banco SQLite no servidor. Reservas, mensagens, tarifas e avaliações são compartilhadas entre computador e celular.

Consulte [a atualização com termo e regras de confirmação](docs/ATUALIZACAO-2026-09-16.md).

## Estado desta versão

Implementação para instalação em servidor Node 24 com disco persistente e uma instância. Não há reservas, tarifas ou avaliações de demonstração no banco. Os dados de contato e fotos existentes no projeto foram preservados; confirme-os antes de publicar.

- Pedidos gravados com protocolo, orçamento em centavos e proteção contra reenvio duplicado.
- Confirmação manual, cancelamento e bloqueio de datas. Pedidos pendentes **não** ocupam a agenda.
- Verificação de sobreposição em transação antes de confirmar. A noite do check-out não é ocupada nem cobrada.
- Tarifas por intervalo real de datas, sexta/sábado, mínimo de noites, limpeza única e sinal fixo de 20%. Tarifas permanecem desligadas até configuração.
- Administração em `/admin`, sessão em cookie HttpOnly, senha derivada com scrypt e registros de auditoria.
- Mensagens no painel; avaliações públicas somente após moderação. Sem selos fictícios de verificação.
- Financeiro: total contratado, recebido e saldo; registro manual de pagamentos/estornos; exportação CSV calculada a partir do banco, sem fórmulas independentes que possam divergir.
- Agenda em ICS para importação manual. Não há sincronização automática com Google Agenda.
- WhatsApp abre conversa com protocolo e resumo. Não envia mensagens automáticas pela API Business.
- Maps usa o link da propriedade já existente; incorporação opcional configurável. O mapa genérico foi retirado.
- PWA com manifesto, ícones, instalação e página offline. API, formulários e dados privados não são armazenados pelo service worker.

## Executar localmente

```bash
npm ci
cp .env.example .env
npm run admin:password
```

O comando de senha solicita a senha sem exibi-la. Copie o hash gerado para `ADMIN_PASSWORD_HASH` no `.env`. Não envie nem publique sua senha. Depois:

```bash
npm run dev
```

Site: http://localhost:3000. Administração: http://localhost:3000/admin. O banco nasce em `data/venus.sqlite` sem registros de hóspedes. API: porta 3001; Vite encaminha `/api` para ela.

## Ativar operação

1. Entre na administração e confira WhatsApp, e-mail, limite de hóspedes e link exato do Maps.
2. Cadastre tarifas reais, sem sobrepor intervalos. Para feriados, crie períodos específicos com datas completas. O fim é exclusivo.
3. Configure a limpeza. O sinal é fixado em 20%.
4. Cadastre bloqueios para reservas externas, manutenção e uso próprio.
5. Habilite “Publicar tarifas e habilitar pedidos de reserva”.
6. Siga o fluxo de aprovação jurídica, assinatura validada e sinal recebido descrito em [docs/ATUALIZACAO-2026-09-16.md](docs/ATUALIZACAO-2026-09-16.md). Somente depois confirme a reserva.

## Publicação

Consulte [docs/DEPLOY.md](docs/DEPLOY.md). Exige Node 24, HTTPS, `APP_URL`, hash da senha e volume persistente. **Não publique somente a pasta `dist`**: a API é necessária. **Não use o SQLite local em funções efêmeras da Vercel ou em serviços sem disco persistente.** Esta versão não foi implantada automaticamente em uma conta de hospedagem.

## Conferência

```bash
npm test
npm run lint
npm run build
npm run backup
```

Testes usam banco isolado, com tarifas somente de teste. Não inserem dados fictícios na operação. Instalação em Android/iPhone reais e restauração no provedor escolhido devem ser conferidas após a publicação.

## Limites explícitos

Inclui instruções de Pix e transferência após cadastro bancário e aprovação jurídica. Não inclui cobrança bancária automática ou cartão, emissão fiscal, envio automático de e-mail/WhatsApp, calendário bidirecional, distribuição em lojas, múltiplos administradores ou sincronização com Airbnb/Booking.com. O painel registra pagamentos informados, não consulta bancos. Reservas externas devem ser bloqueadas manualmente. A exportação financeira não representa lucro nem substitui contabilidade: não inclui despesas ou conciliação bancária.
