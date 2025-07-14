# Como Testar o Sistema Tauri

## ✅ SOLUÇÃO IMPLEMENTADA

O sistema agora funciona **tanto no browser quanto como desktop app** com dados mock realistas.

## Opções de Teste

### 1. 🌐 Teste no Browser (Funciona AGORA)
```bash
npm run dev
```
- ✅ Sistema completo funcional com dados mock
- ✅ Todos os CRUDs funcionando (criar, editar, excluir, marcar ações)
- ✅ Dados persistem durante a sessão
- ✅ Interface idêntica ao desktop app

### 2. 🖥️ Desktop App (Requer Rust)

**Pré-requisitos:**
1. Instalar Rust: https://rustup.rs/
2. CLI Tauri já está instalada

**Comando Simplificado:**
```bash
npx tauri dev
```

**OU usando scripts no package.json:**
```json
{
  "scripts": {
    "tauri": "npx tauri",
    "tauri:dev": "npx tauri dev", 
    "tauri:build": "npx tauri build"
  }
}
```
- Abre a aplicação como desktop app
- Hot-reload ativo
- Banco SQLite criado automaticamente em `src-tauri/database.sqlite`

### 2. Testar Funcionalidades
- ✅ Criar novos processos
- ✅ Listar processos existentes
- ✅ Editar processos
- ✅ Excluir processos
- ✅ Marcar ações como concluídas
- ✅ Filtrar e buscar processos

### 3. Build de Produção
```bash
npm run tauri:build
```
- Gera executável em `src-tauri/target/release/`
- Inclui o database.sqlite como recurso

### 4. Teste de Portabilidade
1. Copie o executável gerado
2. Copie o arquivo `database.sqlite` para a mesma pasta
3. Execute em outra máquina sem dependências

## Arquivos Importantes
- `src-tauri/tauri.conf.json` - Configuração do Tauri
- `src-tauri/src/main.rs` - Backend Rust com comandos SQL
- `src-tauri/Cargo.toml` - Dependências Rust
- `src/lib/tauri.ts` - Interface TypeScript para comandos Tauri

## Comandos Tauri Disponíveis
- `get_all_processes` - Lista todos os processos
- `add_process` - Adiciona novo processo
- `update_process` - Atualiza processo existente
- `delete_process` - Remove processo
- `get_completed_actions` - Lista ações concluídas
- `toggle_action_completion` - Marca/desmarca ação como concluída