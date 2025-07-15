# Setup Tauri 1.6.x - Sistema de Inquéritos

## Scripts necessários no package.json

Como não posso modificar diretamente o package.json, você deve adicionar manualmente os seguintes scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "tauri": "npx tauri",
    "tauri:dev": "npx tauri dev",
    "tauri:build": "npx tauri build"
  }
}
```

## Dependências atualizadas

As dependências já foram atualizadas para:
- `@tauri-apps/api`: `^1.6.0` (compatível com Tauri 1.6.x)
- `@tauri-apps/cli`: `^1.6.0` (para desenvolvimento)

## Configuração completada

✅ **src-tauri/tauri.conf.json** - Atualizado para Tauri 1.6.x com:
- Removido `plugins` da configuração (não suportado em 1.x)
- Adicionados permissões corretas para `fs`, `dialog`, `shell`
- Configuração de bundle atualizada

✅ **src-tauri/Cargo.toml** - Atualizado com:
- `tauri = { version = "1.6", features = ["api-all"] }`
- `tauri-plugin-sql = "1.0"`
- `sqlx` e outras dependências necessárias

✅ **src-tauri/src/main.rs** - Já configurado corretamente com:
- Plugin SQL inicializado com migração
- Comandos para CRUD de processos
- Comandos para ações completadas

✅ **src-tauri/migrations/initial_schema.sql** - Schema do banco configurado

## Como usar

1. Adicione os scripts no `package.json` conforme mostrado acima
2. Para desenvolvimento: `npm run tauri:dev`
3. Para build: `npm run tauri:build`

## Funcionamento offline

O sistema está configurado para:
- ✅ Banco SQLite local
- ✅ Funcionamento 100% offline
- ✅ Executável portátil (pode rodar de pendrive)
- ✅ Banco de dados incluído no bundle

## Estrutura do banco

- **processes**: Armazena todos os processos
- **completed_actions**: Armazena ações completadas por processo
- Indices otimizados para performance
- Triggers automáticos para `updated_at`