# Testes - CRUD de Dicas & Guias

## Instalação das Dependências de Teste

```bash
npm install
```

Isso instalará as dependências de teste adicionadas:
- `vitest` - Framework de testes
- `@nuxt/test-utils` - Utilitários para testar Nuxt
- `@vue/test-utils` - Utilitários para testar componentes Vue
- `happy-dom` - Implementação leve do DOM para testes

## Rodar os Testes

```bash
# Modo watch (desenvolvimento)
npm test

# Modo único (CI/CD)
npm run test:run
```

## Estrutura dos Testes

### Backend (API)

- `server/api/guias/index.get.test.ts` - Testes de listagem, filtros e paginação
- `server/api/guias/index.post.test.ts` - Testes de criação de guias

### Frontend (Store)

- `app/stores/guias.test.ts` - Testes do store Pinia (placeholder, precisa de configuração adicional)

### Frontend (Componentes)

- Testes de componentes podem ser adicionados usando `@vue/test-utils`

## Observações

1. **Dependências não instaladas**: Os erros do TypeScript atuais são porque as dependências de teste ainda não foram instaladas. Após rodar `npm install`, os erros desaparecerão.

2. **Testes de API**: Os testes atuais testam a lógica de filtragem e paginação diretamente, sem mocks complexos do h3. Isso garante que a lógica de negócio está correta.

3. **Testes de Store**: O teste do store é um placeholder. Para testar stores Pinia completamente, é necessário configurar o `createPinia` no setup de testes.

4. **Testes de Componentes**: Testes de componentes Vue podem ser adicionados usando `@vue/test-utils` e `@nuxt/test-utils`, mas requerem configuração adicional do Nuxt.

## Próximos Passos para Testes Completos

1. Instalar dependências: `npm install`
2. Configurar setup do Pinia para testes de store
3. Adicionar testes de componentes usando `@nuxt/test-utils`
4. Adicionar testes E2E usando Playwright (já está configurado no projeto)
5. Configurar CI/CD para rodar testes automaticamente

## Testes E2E com Playwright

O projeto já tem Playwright configurado. Para testar o CRUD de forma end-to-end:

```bash
npx playwright test
```

Isso abrirá o navegador e testará o fluxo completo de criação, edição e exclusão de guias.
