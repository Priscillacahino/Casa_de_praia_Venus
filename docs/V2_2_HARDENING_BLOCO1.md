# Vênus Beach House — v2.2.0 / Bloco 1

Melhorias internas deste bloco:

- percentual do sinal configurável;
- compliance usa o sinal efetivamente salvo na cotação;
- rate limit persistido no SQLite;
- código privado de acompanhamento limitado à sessão do navegador;
- fonte do Guia Vênus configurável e verificação opcional por SHA-256;
- self-test de backup criptografado, restauração e integrity_check;
- self-test incluído no CI;
- schema interno atualizado para user_version 5.

Ainda permanecem externos à validação local: revisão jurídica, HTTPS real, secret manager de produção, conciliação bancária real e testes operacionais no ambiente final.
