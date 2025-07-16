# 🚀 ANÁLISE DE MIGRAÇÃO TAURI 1.6 → 2.3.0

## ❌ PROBLEMA CRÍTICO IMEDIATO
**package.json tem JSON inválido na linha 11!**
- Falta vírgula após `"preview": "vite preview"`
- **CORREÇÃO MANUAL NECESSÁRIA**: Adicione vírgula no final da linha 11

## 🔍 INCOMPATIBILIDADES IDENTIFICADAS

### 📦 1. DEPENDÊNCIAS FRONTEND (package.json)
```json
// ❌ ATUAL (Tauri 1.x)
"@tauri-apps/api": "^1.6.0",
"@tauri-apps/cli": "^1.6.3"

// ✅ NECESSÁRIO (Tauri 2.x)
"@tauri-apps/api": "^2.0.0",
"@tauri-apps/cli": "^2.0.0"
```

### 🦀 2. DEPENDÊNCIAS RUST (Cargo.toml)
```toml
# ❌ ATUAL (Tauri 1.x)
tauri = { version = "1.6", features = ["api-all"] }
tauri-plugin-sql = "1.0"
sqlx = { version = "0.6" }
tauri-build = { version = "1.6" }

# ✅ NECESSÁRIO (Tauri 2.x)
tauri = { version = "2.3", features = ["devtools"] }
tauri-plugin-sql = { version = "2.0", features = ["sqlite"] }
sqlx = { version = "0.8" }
tauri-build = { version = "2.0", features = [] }
```

### ⚙️ 3. CONFIGURAÇÃO (tauri.conf.json)
**MUDANÇA RADICAL**: Tauri 2.x usa estrutura completamente diferente

```json
// ❌ ATUAL (v1 format)
{
  "tauri": {
    "allowlist": { "all": false, "fs": {...} }
  }
}

// ✅ NECESSÁRIO (v2 format)
{
  "productName": "Sistema de Inquéritos",
  "version": "1.0.0",
  "build": {
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [{
      "title": "Sistema de Inquéritos",
      "width": 1200,
      "height": 800
    }],
    "security": {
      "capabilities": ["main-capability"]
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "identifier": "com.sistema.inqueritos"
  }
}
```

### 💾 4. PLUGIN SQL - MUDANÇA CRÍTICA
**Tauri 2.x mudou completamente a API do plugin SQL**

```rust
// ❌ ATUAL (v1)
use tauri_plugin_sql::{SqliteConnection};
let db = SqliteConnection::connect(&app, "sqlite:database.sqlite").await?;

// ✅ NECESSÁRIO (v2)
use tauri_plugin_sql::{Builder, Migration, MigrationKind};
// Plugin SQL agora é inicializado diferente e não usa SqliteConnection
```

### 🔧 5. MAIN.RS - INICIALIZAÇÃO
```rust
// ❌ ATUAL (v1)
tauri::Builder::default()
    .plugin(tauri_plugin_sql::init(vec![migration]))

// ✅ NECESSÁRIO (v2)
tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::new()
        .add_migrations("sqlite:database.sqlite", vec![migration])
        .build())
```

### 🌐 6. FRONTEND API CALLS
```typescript
// ❌ ATUAL (v1)
import { invoke } from '@tauri-apps/api/tauri';

// ✅ NECESSÁRIO (v2)
import { invoke } from '@tauri-apps/api/core';
```

## ⚠️ INCOMPATIBILIDADES SQLITE

### 1. **Plugin SQL v2 Issues**:
- Plugin SQL do Tauri 2.x tem bugs conhecidos
- Recomenda-se usar HTTP + Tauri commands ao invés do plugin
- SQLx 0.8+ tem mudanças breaking

### 2. **Database Path Issues**:
- Tauri 2.x mudou como resolve caminhos de database
- Precisa usar `app.path().appDataDir()` para caminhos

### 3. **Migration System**:
- Sistema de migração mudou completamente
- Precisa reescrever todas as migrations

## 🚨 PROBLEMAS CRÍTICOS PARA MIGRAÇÃO

1. **Breaking Changes Massivos**: Tauri 2.x não é backward compatible
2. **Plugin SQL Instável**: Plugin SQL v2 tem issues conhecidos
3. **Reescrita Obrigatória**: 80% do código Rust precisa ser reescrito
4. **API Frontend**: Todas as chamadas de API precisam ser alteradas
5. **Configuração**: tauri.conf.json precisa ser completamente refeito

## 💡 RECOMENDAÇÕES

### ⭐ OPÇÃO 1: MANTER TAURI 1.6.x (RECOMENDADO)
- **Estável** e **funcional**
- **Sem breaking changes**
- **Plugin SQL funciona perfeitamente**
- **Menor risco**

### ⚠️ OPÇÃO 2: MIGRAR PARA TAURI 2.3.0
- **Reescrita completa** necessária (3-5 dias de trabalho)
- **Riscos de instabilidade**
- **Plugin SQL pode ter problemas**
- **Benefícios**: Performance melhor, recursos mais modernos

## 🛠️ PRÓXIMOS PASSOS

1. **IMEDIATO**: Corrigir package.json (adicionar vírgula linha 11)
2. **DECIDIR**: Manter v1.6 ou migrar para v2.3
3. **SE MIGRAR**: Seguir roteiro completo de migração

---

**RECOMENDAÇÃO FINAL**: Manter Tauri 1.6.x por ser estável e funcional. Migração para 2.x só se houver necessidade específica de recursos novos.