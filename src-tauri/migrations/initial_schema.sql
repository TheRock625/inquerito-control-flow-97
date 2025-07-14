-- Criação das tabelas principais
CREATE TABLE IF NOT EXISTS processes (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    due_date TEXT NOT NULL,
    forwarding TEXT NOT NULL,
    pending_actions TEXT NOT NULL DEFAULT '[]', -- JSON array as TEXT
    summary TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS completed_actions (
    id TEXT PRIMARY KEY,
    process_id TEXT NOT NULL,
    action_text TEXT NOT NULL,
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (process_id) REFERENCES processes (id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_processes_created_at ON processes(created_at);
CREATE INDEX IF NOT EXISTS idx_processes_due_date ON processes(due_date);
CREATE INDEX IF NOT EXISTS idx_completed_actions_process_id ON completed_actions(process_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_processes_updated_at
    AFTER UPDATE ON processes
BEGIN
    UPDATE processes SET updated_at = datetime('now') WHERE id = NEW.id;
END;