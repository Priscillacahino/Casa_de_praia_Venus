# Modelo de ameaças resumido

## Ativos prioritários

1. integridade de preço e disponibilidade;
2. estado de confirmação da reserva;
3. histórico de pagamentos/estornos;
4. documento assinado e respectivo hash;
5. dados pessoais do hóspede;
6. sessão e credenciais administrativas;
7. dados bancários da propriedade;
8. backups e trilha de auditoria.

## Ameaças e controles

| Ameaça | Exemplo | Controle |
|---|---|---|
| Manipulação de preço no cliente | alterar JavaScript/APK | servidor recalcula e compara `expectedTotalCents` |
| Duplo envio | clique/retry | chave idempotente + hash do pedido |
| Dupla reserva | corrida de confirmação | `BEGIN IMMEDIATE` + nova checagem de conflito |
| Pagamento duplicado | mesma transação lançada duas vezes | índice único por método/referência |
| Comprovante falso | imagem editada | sistema só aceita lançamento administrativo após compensação |
| Roubo de senha | phishing/reuso | scrypt + TOTP em produção + sessão HttpOnly/Strict |
| CSRF/origem maliciosa | site externo dispara ação | validação de Origin/Sec-Fetch-Site + SameSite Strict |
| XSS | conteúdo injetado | frontend sem HTML de usuário, CSP e escaping no admin |
| Exfiltração pelo guia | conteúdo remoto tenta chamar API | CSP separada no web; WebView restrita no Android |
| Vazamento de backup | cópia do SQLite | AES-256-GCM e chave fora do repositório |
| Retenção excessiva | contatos esquecidos | rotina de retenção/anomização controlada |
| Alteração da trilha | edição silenciosa | cadeia de hashes + verificador independente |

## Fora do controle exclusivo do código

- comprometimento do provedor de hospedagem;
- comprometimento da conta bancária;
- falha de revisão jurídica;
- erro humano na conciliação;
- dispositivo administrativo comprometido;
- credenciais do GitHub/Vercel comprometidas.

Esses riscos exigem controles organizacionais, MFA em contas externas, menor privilégio e procedimentos de dupla conferência.
