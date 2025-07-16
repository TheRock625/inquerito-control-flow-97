// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::Manager;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Process {
    pub id: String,
    pub number: String,
    #[serde(rename = "type")]
    pub process_type: String,
    pub status: String,
    pub due_date: String,
    pub forwarding: String,
    pub pending_actions: String,
    pub summary: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessData {
    pub number: String,
    #[serde(rename = "type")]
    pub process_type: String,
    pub status: String,
    pub due_date: String,
    pub forwarding: String,
    pub pending_actions: String,
    pub summary: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessUpdates {
    pub number: Option<String>,
    #[serde(rename = "type")]
    pub process_type: Option<String>,
    pub status: Option<String>,
    pub due_date: Option<String>,
    pub forwarding: Option<String>,
    pub pending_actions: Option<String>,
    pub summary: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CompletedAction {
    pub id: String,
    pub process_id: String,
    pub action_text: String,
    pub completed_at: String,
}

#[tauri::command]
async fn get_all_processes(app: tauri::AppHandle) -> Result<Vec<Process>, String> {
    let db = app.state::<tauri_plugin_sql::Db>();
    
    let result = db.execute(
        "SELECT id, number, type, status, due_date, forwarding, pending_actions, summary, created_at, updated_at FROM processes ORDER BY created_at DESC",
        vec![]
    )
    .await
    .map_err(|e| format!("Failed to fetch processes: {}", e))?;

    let mut processes = Vec::new();
    for row in result.rows {
        let process = Process {
            id: row.get::<String>(0).ok_or("Missing id")?,
            number: row.get::<String>(1).ok_or("Missing number")?,
            process_type: row.get::<String>(2).ok_or("Missing type")?,
            status: row.get::<String>(3).ok_or("Missing status")?,
            due_date: row.get::<String>(4).ok_or("Missing due_date")?,
            forwarding: row.get::<String>(5).ok_or("Missing forwarding")?,
            pending_actions: row.get::<String>(6).unwrap_or_else(|| "[]".to_string()),
            summary: row.get::<Option<String>>(7).unwrap_or(None),
            created_at: row.get::<String>(8).ok_or("Missing created_at")?,
            updated_at: row.get::<String>(9).ok_or("Missing updated_at")?,
        };
        processes.push(process);
    }

    Ok(processes)
}

#[tauri::command]
async fn add_process(app: tauri::AppHandle, process_data: ProcessData) -> Result<Process, String> {
    let db = app.state::<tauri_plugin_sql::Db>();
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    db.execute(
        "INSERT INTO processes (id, number, type, status, due_date, forwarding, pending_actions, summary, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        vec![
            tauri_plugin_sql::Value::Text(id.clone()),
            tauri_plugin_sql::Value::Text(process_data.number.clone()),
            tauri_plugin_sql::Value::Text(process_data.process_type.clone()),
            tauri_plugin_sql::Value::Text(process_data.status.clone()),
            tauri_plugin_sql::Value::Text(process_data.due_date.clone()),
            tauri_plugin_sql::Value::Text(process_data.forwarding.clone()),
            tauri_plugin_sql::Value::Text(process_data.pending_actions.clone()),
            process_data.summary.map(tauri_plugin_sql::Value::Text).unwrap_or(tauri_plugin_sql::Value::Null),
            tauri_plugin_sql::Value::Text(now.clone()),
            tauri_plugin_sql::Value::Text(now.clone()),
        ]
    )
    .await
    .map_err(|e| format!("Failed to insert process: {}", e))?;

    Ok(Process {
        id,
        number: process_data.number,
        process_type: process_data.process_type,
        status: process_data.status,
        due_date: process_data.due_date,
        forwarding: process_data.forwarding,
        pending_actions: process_data.pending_actions,
        summary: process_data.summary,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
async fn update_process(app: tauri::AppHandle, process_id: String, updates: ProcessUpdates) -> Result<Process, String> {
    let db = app.state::<tauri_plugin_sql::Db>();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let mut query_parts = Vec::new();
    let mut params = Vec::new();
    let mut param_count = 1;

    if let Some(number) = &updates.number {
        query_parts.push(format!("number = ?{}", param_count));
        params.push(tauri_plugin_sql::Value::Text(number.clone()));
        param_count += 1;
    }
    if let Some(process_type) = &updates.process_type {
        query_parts.push(format!("type = ?{}", param_count));
        params.push(tauri_plugin_sql::Value::Text(process_type.clone()));
        param_count += 1;
    }
    if let Some(status) = &updates.status {
        query_parts.push(format!("status = ?{}", param_count));
        params.push(tauri_plugin_sql::Value::Text(status.clone()));
        param_count += 1;
    }
    if let Some(due_date) = &updates.due_date {
        query_parts.push(format!("due_date = ?{}", param_count));
        params.push(tauri_plugin_sql::Value::Text(due_date.clone()));
        param_count += 1;
    }
    if let Some(forwarding) = &updates.forwarding {
        query_parts.push(format!("forwarding = ?{}", param_count));
        params.push(tauri_plugin_sql::Value::Text(forwarding.clone()));
        param_count += 1;
    }
    if let Some(pending_actions) = &updates.pending_actions {
        query_parts.push(format!("pending_actions = ?{}", param_count));
        params.push(tauri_plugin_sql::Value::Text(pending_actions.clone()));
        param_count += 1;
    }
    if let Some(summary) = &updates.summary {
        query_parts.push(format!("summary = ?{}", param_count));
        params.push(tauri_plugin_sql::Value::Text(summary.clone()));
        param_count += 1;
    }

    query_parts.push(format!("updated_at = ?{}", param_count));
    params.push(tauri_plugin_sql::Value::Text(now.clone()));
    param_count += 1;
    
    params.push(tauri_plugin_sql::Value::Text(process_id.clone()));

    let query = format!("UPDATE processes SET {} WHERE id = ?{}", query_parts.join(", "), param_count);

    db.execute(&query, params)
        .await
        .map_err(|e| format!("Failed to update process: {}", e))?;

    // Fetch and return updated process
    let result = db.execute(
        "SELECT id, number, type, status, due_date, forwarding, pending_actions, summary, created_at, updated_at FROM processes WHERE id = ?1",
        vec![tauri_plugin_sql::Value::Text(process_id)]
    )
    .await
    .map_err(|e| format!("Failed to fetch updated process: {}", e))?;

    if let Some(row) = result.rows.first() {
        Ok(Process {
            id: row.get::<String>(0).ok_or("Missing id")?,
            number: row.get::<String>(1).ok_or("Missing number")?,
            process_type: row.get::<String>(2).ok_or("Missing type")?,
            status: row.get::<String>(3).ok_or("Missing status")?,
            due_date: row.get::<String>(4).ok_or("Missing due_date")?,
            forwarding: row.get::<String>(5).ok_or("Missing forwarding")?,
            pending_actions: row.get::<String>(6).unwrap_or_else(|| "[]".to_string()),
            summary: row.get::<Option<String>>(7).unwrap_or(None),
            created_at: row.get::<String>(8).ok_or("Missing created_at")?,
            updated_at: row.get::<String>(9).ok_or("Missing updated_at")?,
        })
    } else {
        Err("Process not found after update".to_string())
    }
}

#[tauri::command]
async fn delete_process(app: tauri::AppHandle, process_id: String) -> Result<(), String> {
    let db = app.state::<tauri_plugin_sql::Db>();

    db.execute("DELETE FROM processes WHERE id = ?1", vec![tauri_plugin_sql::Value::Text(process_id)])
        .await
        .map_err(|e| format!("Failed to delete process: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn get_completed_actions(app: tauri::AppHandle) -> Result<HashMap<String, Vec<String>>, String> {
    let db = app.state::<tauri_plugin_sql::Db>();

    let result = db.execute("SELECT process_id, action_text FROM completed_actions", vec![])
        .await
        .map_err(|e| format!("Failed to fetch completed actions: {}", e))?;

    let mut actions_map: HashMap<String, Vec<String>> = HashMap::new();
    for row in result.rows {
        let process_id = row.get::<String>(0).ok_or("Missing process_id")?;
        let action_text = row.get::<String>(1).ok_or("Missing action_text")?;
        
        actions_map.entry(process_id).or_insert_with(Vec::new).push(action_text);
    }

    Ok(actions_map)
}

#[tauri::command]
async fn toggle_action_completion(app: tauri::AppHandle, process_id: String, action_text: String) -> Result<bool, String> {
    let db = app.state::<tauri_plugin_sql::Db>();

    // Check if action is already completed
    let result = db.execute(
        "SELECT id FROM completed_actions WHERE process_id = ?1 AND action_text = ?2",
        vec![
            tauri_plugin_sql::Value::Text(process_id.clone()),
            tauri_plugin_sql::Value::Text(action_text.clone())
        ]
    )
    .await
    .map_err(|e| format!("Failed to check action completion: {}", e))?;

    if result.rows.is_empty() {
        // Add completion
        let id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
        
        db.execute(
            "INSERT INTO completed_actions (id, process_id, action_text, completed_at) VALUES (?1, ?2, ?3, ?4)",
            vec![
                tauri_plugin_sql::Value::Text(id),
                tauri_plugin_sql::Value::Text(process_id),
                tauri_plugin_sql::Value::Text(action_text),
                tauri_plugin_sql::Value::Text(now)
            ]
        )
        .await
        .map_err(|e| format!("Failed to add completed action: {}", e))?;
        
        Ok(true) // Action is now completed
    } else {
        // Remove completion
        db.execute(
            "DELETE FROM completed_actions WHERE process_id = ?1 AND action_text = ?2",
            vec![
                tauri_plugin_sql::Value::Text(process_id),
                tauri_plugin_sql::Value::Text(action_text)
            ]
        )
        .await
        .map_err(|e| format!("Failed to remove completed action: {}", e))?;
        
        Ok(false) // Action is now uncompleted
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let db = app_handle.state::<tauri_plugin_sql::Db>();
                
                // Run migrations
                let migration_sql = include_str!("../migrations/initial_schema.sql");
                if let Err(e) = db.execute(migration_sql, vec![]).await {
                    eprintln!("Failed to run migration: {}", e);
                }
            });
            
            Ok(())
        })
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

fn main() {
    run();
}