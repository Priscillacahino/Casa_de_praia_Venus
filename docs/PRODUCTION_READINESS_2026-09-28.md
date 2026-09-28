# Production readiness — 28/09/2026

## Implementado sem dependências externas
- fluxo autenticado de solicitação de cancelamento pelo hóspede;
- decisão administrativa separada, sem estorno automático;
- bloqueio de novos pagamentos durante cancelamento pendente;
- bloqueio de confirmação enquanto cancelamento está pendente;
- trilha de auditoria para solicitação/aceite/recusa;
- documento do titular bancário removido da resposta destinada ao hóspede;
- sessão administrativa reduzida para duas horas;
- sessão expirada removida do banco ao ser reutilizada;
- painel administrativo removido do cache offline e marcado como noindex;
- política pública de privacidade operacional;
- termo público condicionado à aprovação da versão vigente;
- retenção evita anonimizar solicitações com cancelamento pendente e limpa textos livres quando anonimiza;
- procedimento de resposta a incidentes;
- cobertura automatizada do novo fluxo.

## Fluxo comercial simplificado
- site recebe a solicitação e mantém protocolo/código privado;
- dados bancários não são publicados no site;
- WhatsApp é a ponte para combinar Pix ou transferência;
- hóspede pode avisar pelo site que pagou;
- somente a conferência bancária administrativa registra recebimento;
- confirmação final continua visível no acompanhamento do site.

## Bloqueios que continuam externos
- domínio HTTPS definitivo e validação externa dos cabeçalhos;
- infraestrutura Node 24 com volume persistente/criptografado;
- secret manager e segredos reais;
- backup externo automatizado e teste de restauração em ambiente isolado;
- revisão jurídica da versão exata do termo e política de privacidade;
- conferência dos dados bancários reais e teste controlado de pagamento/reembolso;
- monitoramento/alertas do ambiente;
- revisão independente de segurança antes de aumento relevante de volume.

Nenhum desses bloqueios deve ser contornado por código fictício ou dados de demonstração em produção.
