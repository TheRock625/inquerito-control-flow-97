// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{command, State};
use tauri_plugin_sql::{Migration, MigrationKind, SqliteConnection};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
struct Process {
    id: String,
    number: String,
    r#type: String,
    status: String,
    due_date: String,
    forwarding: String,
    pending_actions: Vec<String>,
    summary: Option<String>,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProcessData {
    number: String,
    r#type: String,
    status: String,
    due_date: String,
    forwarding: String,
    pending_actions: Vec<String>,
    summary: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProcessUpdates {
    number: Option<String>,
    r#type: Option<String>,
    status: Option<String>,
    due_date: Option<String>,
    forwarding: Option<String>,
    pending_actions: Option<Vec<String>>,
    summary: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct CompletedAction {
    id: String,
    process_id: String,
    action_text: String,
    completed_at: String,
}

// Commands para operações de processos
#[command]
async fn get_all_processes(app: tauri::AppHandle) -> Result<Vec<Process>, String> {
    let db = tauri_plugin_sql::SqliteConnection::connect(&app, "sqlite:database.sqlite")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let query = "SELECT id, number, type, status, due_date, forwarding, pending_actions, summary, created_at, updated_at FROM processes ORDER BY created_at DESC";
    
    let result = db.execute(query, vec![])
        .await
        .map_err(|e| format!("Failed to execute query: {}", e))?;

    let mut processes = Vec::new();
    
    for row in result {
        let pending_actions_str = row.get::<String>("pending_actions").unwrap_or_else(|| "[]".to_string());
        let pending_actions: Vec<String> = serde_json::from_str(&pending_actions_str)
            .unwrap_or_else(|_| vec![]);

        processes.push(Process {
            id: row.get("id").unwrap(),
            number: row.get("number").unwrap(),
            r#type: row.get("type").unwrap(),
            status: row.get("status").unwrap(),
            due_date: row.get("due_date").unwrap(),
            forwarding: row.get("forwarding").unwrap(),
            pending_actions,
            summary: row.get("summary"),
            created_at: row.get("created_at").unwrap(),
            updated_at: row.get("updated_at").unwrap(),
        });
    }

    Ok(processes)
}

#[command]
async fn add_process(app: tauri::AppHandle, process_data: ProcessData) -> Result<Process, String> {
    let db = tauri_plugin_sql::SqliteConnection::connect(&app, "sqlite:database.sqlite")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let id = Uuid::new_v4().to_string();
    let pending_actions_json = serde_json::to_string(&process_data.pending_actions)
        .map_err(|e| format!("Failed to serialize pending_actions: {}", e))?;
    
    let now = chrono::Utc::now().to_rfc3339();

    let query = "INSERT INTO processes (id, number, type, status, due_date, forwarding, pending_actions, summary, created_at, updated_at) 
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)";
    
    db.execute(query, vec![
        tauri_plugin_sql::Value::Text(id.clone()),
        tauri_plugin_sql::Value::Text(process_data.number.clone()),
        tauri_plugin_sql::Value::Text(process_data.r#type.clone()),
        tauri_plugin_sql::Value::Text(process_data.status.clone()),
        tauri_plugin_sql::Value::Text(process_data.due_date.clone()),
        tauri_plugin_sql::Value::Text(process_data.forwarding.clone()),
        tauri_plugin_sql::Value::Text(pending_actions_json),
        process_data.summary.map(tauri_plugin_sql::Value::Text).unwrap_or(tauri_plugin_sql::Value::Null),
        tauri_plugin_sql::Value::Text(now.clone()),
        tauri_plugin_sql::Value::Text(now.clone()),
    ])
    .await
    .map_err(|e| format!("Failed to insert process: {}", e))?;

    Ok(Process {
        id,
        number: process_data.number,
        r#type: process_data.r#type,
        status: process_data.status,
        due_date: process_data.due_date,
        forwarding: process_data.forwarding,
        pending_actions: process_data.pending_actions,
        summary: process_data.summary,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[command]
async fn update_process(app: tauri::AppHandle, process_id: String, updates: ProcessUpdates) -> Result<Process, String> {
    let db = tauri_plugin_sql::SqliteConnection::connect(&app, "sqlite:database.sqlite")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let mut set_clauses = Vec::new();
    let mut values = Vec::new();
    let mut param_count = 1;

    if let Some(number) = updates.number {
        set_clauses.push(format!("number = ?{}", param_count));
        values.push(tauri_plugin_sql::Value::Text(number));
        param_count += 1;
    }
    
    if let Some(r#type) = updates.r#type {
        set_clauses.push(format!("type = ?{}", param_count));
        values.push(tauri_plugin_sql::Value::Text(r#type));
        param_count += 1;
    }
    
    if let Some(status) = updates.status {
        set_clauses.push(format!("status = ?{}", param_count));
        values.push(tauri_plugin_sql::Value::Text(status));
        param_count += 1;
    }
    
    if let Some(due_date) = updates.due_date {
        set_clauses.push(format!("due_date = ?{}", param_count));
        values.push(tauri_plugin_sql::Value::Text(due_date));
        param_count += 1;
    }
    
    if let Some(forwarding) = updates.forwarding {
        set_clauses.push(format!("forwarding = ?{}", param_count));
        values.push(tauri_plugin_sql::Value::Text(forwarding));
        param_count += 1;
    }
    
    if let Some(pending_actions) = updates.pending_actions {
        let pending_actions_json = serde_json::to_string(&pending_actions)
            .map_err(|e| format!("Failed to serialize pending_actions: {}", e))?;
        set_clauses.push(format!("pending_actions = ?{}", param_count));
        values.push(tauri_plugin_sql::Value::Text(pending_actions_json));
        param_count += 1;
    }
    
    if let Some(summary) = updates.summary {
        set_clauses.push(format!("summary = ?{}", param_count));
        values.push(tauri_plugin_sql::Value::Text(summary));
        param_count += 1;
    }

    if set_clauses.is_empty() {
        return Err("No fields to update".to_string());
    }

    let now = chrono::Utc::now().to_rfc3339();
    set_clauses.push(format!("updated_at = ?{}", param_count));
    values.push(tauri_plugin_sql::Value::Text(now));
    
    values.push(tauri_plugin_sql::Value::Text(process_id.clone()));

    let query = format!("UPDATE processes SET {} WHERE id = ?{}", 
                       set_clauses.join(", "), param_count + 1);

    db.execute(&query, values)
        .await
        .map_err(|e| format!("Failed to update process: {}", e))?;

    // Retornar o processo atualizado
    let select_query = "SELECT id, number, type, status, due_date, forwarding, pending_actions, summary, created_at, updated_at FROM processes WHERE id = ?1";
    let result = db.execute(select_query, vec![tauri_plugin_sql::Value::Text(process_id)])
        .await
        .map_err(|e| format!("Failed to fetch updated process: {}", e))?;

    if let Some(row) = result.into_iter().next() {
        let pending_actions_str = row.get::<String>("pending_actions").unwrap_or_else(|| "[]".to_string());
        let pending_actions: Vec<String> = serde_json::from_str(&pending_actions_str)
            .unwrap_or_else(|_| vec![]);

        Ok(Process {
            id: row.get("id").unwrap(),
            number: row.get("number").unwrap(),
            r#type: row.get("type").unwrap(),
            status: row.get("status").unwrap(),
            due_date: row.get("due_date").unwrap(),
            forwarding: row.get("forwarding").unwrap(),
            pending_actions,
            summary: row.get("summary"),
            created_at: row.get("created_at").unwrap(),
            updated_at: row.get("updated_at").unwrap(),
        })
    } else {
        Err("Process not found after update".to_string())
    }
}

#[command]
async fn delete_process(app: tauri::AppHandle, process_id: String) -> Result<(), String> {
    let db = tauri_plugin_sql::SqliteConnection::connect(&app, "sqlite:database.sqlite")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let query = "DELETE FROM processes WHERE id = ?1";
    
    db.execute(query, vec![tauri_plugin_sql::Value::Text(process_id)])
        .await
        .map_err(|e| format!("Failed to delete process: {}", e))?;

    Ok(())
}

// Commands para completed_actions
#[command]
async fn get_completed_actions(app: tauri::AppHandle) -> Result<HashMap<String, Vec<String>>, String> {
    let db = tauri_plugin_sql::SqliteConnection::connect(&app, "sqlite:database.sqlite")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let query = "SELECT process_id, action_text FROM completed_actions";
    
    let result = db.execute(query, vec![])
        .await
        .map_err(|e| format!("Failed to execute query: {}", e))?;

    let mut grouped: HashMap<String, Vec<String>> = HashMap::new();
    
    for row in result {
        let process_id: String = row.get("process_id").unwrap();
        let action_text: String = row.get("action_text").unwrap();
        
        grouped.entry(process_id).or_insert_with(Vec::new).push(action_text);
    }

    Ok(grouped)
}

#[command]
async fn toggle_action_completion(app: tauri::AppHandle, process_id: String, action_text: String) -> Result<bool, String> {
    let db = tauri_plugin_sql::SqliteConnection::connect(&app, "sqlite:database.sqlite")
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    // Verificar se a ação já está concluída
    let check_query = "SELECT id FROM completed_actions WHERE process_id = ?1 AND action_text = ?2";
    let existing = db.execute(check_query, vec![
        tauri_plugin_sql::Value::Text(process_id.clone()),
        tauri_plugin_sql::Value::Text(action_text.clone()),
    ])
    .await
    .map_err(|e| format!("Failed to check existing action: {}", e))?;

    if existing.is_empty() {
        // Adicionar ação concluída
        let id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();
        
        let insert_query = "INSERT INTO completed_actions (id, process_id, action_text, completed_at) VALUES (?1, ?2, ?3, ?4)";
        db.execute(insert_query, vec![
            tauri_plugin_sql::Value::Text(id),
            tauri_plugin_sql::Value::Text(process_id),
            tauri_plugin_sql::Value::Text(action_text),
            tauri_plugin_sql::Value::Text(now),
        ])
        .await
        .map_err(|e| format!("Failed to insert completed action: {}", e))?;
        
        Ok(true) // Agora está concluída
    } else {
        // Remover ação concluída
        let delete_query = "DELETE FROM completed_actions WHERE process_id = ?1 AND action_text = ?2";
        db.execute(delete_query, vec![
            tauri_plugin_sql::Value::Text(process_id),
            tauri_plugin_sql::Value::Text(action_text),
        ])
        .await
        .map_err(|e| format!("Failed to delete completed action: {}", e))?;
        
        Ok(false) // Agora não está mais concluída
    }
}

fn main() {
    let migration = Migration {
        version: 1,
        description: "Initial schema",
        sql: include_str!("../migrations/initial_schema.sql"),
        kind: MigrationKind::Up,
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::init(vec![migration]))
        .invoke_handler(tauri::generate_handler![
            get_all_processes,
            add_process,
            update_process,
            delete_process,
            get_completed_actions,
            toggle_action_completion
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}