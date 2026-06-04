#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::fs;
use std::sync::Mutex;
use tauri::{State, Manager};
use keyring::Entry;
use rusqlite::{Connection, params};
use serde_json::{Value, Map};

struct DbState {
  conn: Mutex<Connection>,
}

// ==========================================
// 1. OS Keychain Secure Storage Commands
// ==========================================
const KEYCHAIN_SERVICE_NAME: &str = "ielts_prep_platform";

fn is_whitelisted_key(key: &str) -> bool {
  key == "openai_api_key" || key == "gemini_api_key"
}

#[tauri::command]
fn keychain_get(key: String) -> Result<Option<String>, String> {
  if !is_whitelisted_key(&key) {
    return Err(format!("Unauthorized key access: {}", key));
  }

  let entry = Entry::new(KEYCHAIN_SERVICE_NAME, &key)
    .map_err(|e| format!("Failed to initialize keyring entry: {}", e))?;
  
  match entry.get_password() {
    Ok(pwd) => Ok(Some(pwd)),
    Err(keyring::Error::NoEntry) => Ok(None),
    Err(e) => Err(format!("Keyring error: {}", e)),
  }
}

#[tauri::command]
fn keychain_set(key: String, value: String) -> Result<(), String> {
  if !is_whitelisted_key(&key) {
    return Err(format!("Unauthorized key access: {}", key));
  }

  let entry = Entry::new(KEYCHAIN_SERVICE_NAME, &key)
    .map_err(|e| format!("Failed to initialize keyring entry: {}", e))?;
  
  entry.set_password(&value)
    .map_err(|e| format!("Failed to store key in OS keychain: {}", e))
}

#[tauri::command]
fn keychain_delete(key: String) -> Result<(), String> {
  if !is_whitelisted_key(&key) {
    return Err(format!("Unauthorized key access: {}", key));
  }

  let entry = Entry::new(KEYCHAIN_SERVICE_NAME, &key)
    .map_err(|e| format!("Failed to initialize keyring entry: {}", e))?;
  
  match entry.delete_password() {
    Ok(_) => Ok(()),
    Err(keyring::Error::NoEntry) => Ok(()), // Silently succeed if already deleted
    Err(e) => Err(format!("Failed to delete key: {}", e)),
  }
}

// ==========================================
// 2. Embedded SQLite Engine Commands (Business-specific, Parameterized)
// ==========================================

#[tauri::command]
fn save_attempt(state: State<DbState>, attempt: serde_json::Value) -> Result<(), String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let local_id = attempt["local_id"].as_str().ok_or("local_id is missing")?;
  let remote_id = attempt["remote_id"].as_str().unwrap_or("");
  let test_id = attempt["testId"].as_str().ok_or("testId is missing")?;
  let user_id = attempt["userId"].as_str().ok_or("userId is missing")?;
  let status = attempt["status"].as_str().ok_or("status is missing")?;
  let started_at = attempt["startedAt"].as_str().ok_or("startedAt is missing")?;
  let last_saved_at = attempt["lastSavedAt"].as_str().ok_or("lastSavedAt is missing")?;
  let submitted_at = attempt["submittedAt"].as_str().unwrap_or("");
  let duration_seconds = attempt["durationSeconds"].as_i64().ok_or("durationSeconds is missing")?;
  let remaining_seconds = attempt["remainingSeconds"].as_i64().ok_or("remainingSeconds is missing")?;
  
  let answers_json = serde_json::to_string(&attempt["answers"]).unwrap_or_else(|_| "{}".to_string());
  let pause_ranges_json = serde_json::to_string(&attempt["pauseRanges"]).unwrap_or_else(|_| "[]".to_string());
  
  let scores = &attempt["scores"];
  let (raw_score, band_score, total_questions, is_mock_scoring) = if scores.is_object() {
    let raw = scores["rawScore"].as_i64().unwrap_or(0);
    let band = scores["bandScore"].as_f64().unwrap_or(0.0);
    let total = scores["totalQuestions"].as_i64().unwrap_or(0);
    let mock = if scores["isMockScoring"].as_bool().unwrap_or(false) { 1 } else { 0 };
    (raw, band, total, mock)
  } else {
    (0, 0.0, 0, 0)
  };
  
  let created_at = attempt["createdAt"].as_str().ok_or("createdAt is missing")?;
  let updated_at = attempt["updatedAt"].as_str().ok_or("updatedAt is missing")?;
  let sync_status = attempt["sync_status"].as_str().ok_or("sync_status is missing")?;
  let version = attempt["version"].as_i64().ok_or("version is missing")?;

  conn.execute(
    "INSERT OR REPLACE INTO attempts (
      local_id, remote_id, test_id, user_id, status, 
      started_at, last_saved_at, submitted_at, duration_seconds, remaining_seconds, 
      answers_json, pause_ranges_json, raw_score, band_score, total_questions, is_mock_scoring, 
      created_at, updated_at, sync_status, version
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)",
    params![
      local_id, remote_id, test_id, user_id, status,
      started_at, last_saved_at, submitted_at, duration_seconds, remaining_seconds,
      answers_json, pause_ranges_json, raw_score, band_score, total_questions, is_mock_scoring,
      created_at, updated_at, sync_status, version
    ]
  ).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
fn get_attempt(state: State<DbState>, local_id: String) -> Result<Option<serde_json::Value>, String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let mut stmt = conn.prepare("SELECT * FROM attempts WHERE local_id = ?1 LIMIT 1").map_err(|e| e.to_string())?;
  
  let col_count = stmt.column_count();
  let mut col_names = Vec::new();
  for i in 0..col_count {
    col_names.push(stmt.column_name(i).map_err(|e| e.to_string())?.to_string());
  }
  
  let mut rows = stmt.query(params![local_id]).map_err(|e| e.to_string())?;
  
  if let Some(row) = rows.next().map_err(|e| e.to_string())? {
    let mut map = Map::new();
    for (i, name) in col_names.iter().enumerate() {
      let value = match row.get_ref(i).map_err(|e| e.to_string())? {
        rusqlite::types::ValueRef::Null => Value::Null,
        rusqlite::types::ValueRef::Integer(n) => Value::Number(n.into()),
        rusqlite::types::ValueRef::Real(r) => {
          if let Some(num) = serde_json::Number::from_f64(r) {
            Value::Number(num)
          } else {
            Value::Null
          }
        },
        rusqlite::types::ValueRef::Text(t) => Value::String(String::from_utf8_lossy(t).into_owned()),
        rusqlite::types::ValueRef::Blob(_) => Value::Null,
      };
      map.insert(name.clone(), value);
    }
    Ok(Some(Value::Object(map)))
  } else {
    Ok(None)
  }
}

#[tauri::command]
fn list_attempts(state: State<DbState>, user_id: String) -> Result<Vec<serde_json::Value>, String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let mut stmt = conn.prepare("SELECT * FROM attempts WHERE user_id = ?1").map_err(|e| e.to_string())?;
  
  let col_count = stmt.column_count();
  let mut col_names = Vec::new();
  for i in 0..col_count {
    col_names.push(stmt.column_name(i).map_err(|e| e.to_string())?.to_string());
  }
  
  let mut rows = stmt.query(params![user_id]).map_err(|e| e.to_string())?;
  let mut results = Vec::new();
  
  while let Some(row) = rows.next().map_err(|e| e.to_string())? {
    let mut map = Map::new();
    for (i, name) in col_names.iter().enumerate() {
      let value = match row.get_ref(i).map_err(|e| e.to_string())? {
        rusqlite::types::ValueRef::Null => Value::Null,
        rusqlite::types::ValueRef::Integer(n) => Value::Number(n.into()),
        rusqlite::types::ValueRef::Real(r) => {
          if let Some(num) = serde_json::Number::from_f64(r) {
            Value::Number(num)
          } else {
            Value::Null
          }
        },
        rusqlite::types::ValueRef::Text(t) => Value::String(String::from_utf8_lossy(t).into_owned()),
        rusqlite::types::ValueRef::Blob(_) => Value::Null,
      };
      map.insert(name.clone(), value);
    }
    results.push(Value::Object(map));
  }
  Ok(results)
}

#[tauri::command]
fn save_learning_event(state: State<DbState>, event: serde_json::Value) -> Result<(), String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let id = event["id"].as_str().ok_or("id is missing")?;
  let event_type = event["type"].as_str().ok_or("type is missing")?;
  let learner_id = event["learnerId"].as_str().ok_or("learnerId is missing")?;
  let entity_type = event["entityType"].as_str().ok_or("entityType is missing")?;
  let entity_id = event["entityId"].as_str().ok_or("entityId is missing")?;
  let occurred_at = event["occurredAt"].as_str().ok_or("occurredAt is missing")?;
  let source = event["source"].as_str().unwrap_or("miuprep_desktop");
  let payload_json = serde_json::to_string(&event["payload"]).unwrap_or_else(|_| "{}".to_string());
  let raw_json = serde_json::to_string(&event).map_err(|e| e.to_string())?;

  conn.execute(
    "INSERT OR REPLACE INTO learning_events (
      id, type, learner_id, entity_type, entity_id, occurred_at, source, payload_json, raw_json, created_at
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, datetime('now'))",
    params![id, event_type, learner_id, entity_type, entity_id, occurred_at, source, payload_json, raw_json],
  ).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
fn list_learning_events(state: State<DbState>, user_id: Option<String>, limit: Option<i64>) -> Result<Vec<serde_json::Value>, String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let limit_val = limit.unwrap_or(200).clamp(1, 1000);
  let user_filter = user_id.filter(|value| !value.trim().is_empty());

  let mut results = Vec::new();
  if let Some(uid) = user_filter {
    let mut stmt = conn.prepare(
      "SELECT raw_json FROM learning_events WHERE learner_id = ?1 ORDER BY occurred_at DESC LIMIT ?2"
    ).map_err(|e| e.to_string())?;
    let mut rows = stmt.query(params![uid, limit_val]).map_err(|e| e.to_string())?;
    while let Some(row) = rows.next().map_err(|e| e.to_string())? {
      let raw_json: String = row.get(0).map_err(|e| e.to_string())?;
      let value: serde_json::Value = serde_json::from_str(&raw_json).map_err(|e| e.to_string())?;
      results.push(value);
    }
  } else {
    let mut stmt = conn.prepare(
      "SELECT raw_json FROM learning_events ORDER BY occurred_at DESC LIMIT ?1"
    ).map_err(|e| e.to_string())?;
    let mut rows = stmt.query(params![limit_val]).map_err(|e| e.to_string())?;
    while let Some(row) = rows.next().map_err(|e| e.to_string())? {
      let raw_json: String = row.get(0).map_err(|e| e.to_string())?;
      let value: serde_json::Value = serde_json::from_str(&raw_json).map_err(|e| e.to_string())?;
      results.push(value);
    }
  }

  Ok(results)
}

#[tauri::command]
fn get_test(state: State<DbState>, id: String) -> Result<Option<serde_json::Value>, String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let mut stmt = conn.prepare("SELECT * FROM tests WHERE id = ?1 LIMIT 1").map_err(|e| e.to_string())?;
  let mut rows = stmt.query(params![id]).map_err(|e| e.to_string())?;
  
  if let Some(row) = rows.next().map_err(|e| e.to_string())? {
    let raw_json: String = row.get(4).map_err(|e| e.to_string())?;
    let test_val: serde_json::Value = serde_json::from_str(&raw_json).map_err(|e| e.to_string())?;
    Ok(Some(test_val))
  } else {
    Ok(None)
  }
}

#[tauri::command]
fn save_test(state: State<DbState>, test: serde_json::Value) -> Result<(), String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let id = test["id"].as_str().ok_or("id is missing")?;
  let title = test["title"].as_str().ok_or("title is missing")?;
  let skill = test["skill"].as_str().ok_or("skill is missing")?;
  let test_type = test["type"].as_str().ok_or("type is missing")?;
  let raw_json = serde_json::to_string(&test).map_err(|e| e.to_string())?;

  conn.execute(
    "INSERT OR REPLACE INTO tests (id, title, skill, type, raw_json, created_at) VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'))",
    params![id, title, skill, test_type, raw_json]
  ).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
fn list_tests(state: State<DbState>) -> Result<Vec<serde_json::Value>, String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let mut stmt = conn.prepare("SELECT * FROM tests").map_err(|e| e.to_string())?;
  let mut rows = stmt.query(params![]).map_err(|e| e.to_string())?;
  let mut results = Vec::new();
  
  while let Some(row) = rows.next().map_err(|e| e.to_string())? {
    let raw_json: String = row.get(4).map_err(|e| e.to_string())?;
    let test_val: serde_json::Value = serde_json::from_str(&raw_json).map_err(|e| e.to_string())?;
    results.push(test_val);
  }
  Ok(results)
}

#[tauri::command]
fn save_writing_feedback(state: State<DbState>, feedback: serde_json::Value) -> Result<(), String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let attempt_id = feedback["attemptId"].as_str().ok_or("attemptId is missing")?;
  let task_number = feedback["taskNumber"].as_i64().ok_or("taskNumber is missing")?;
  let raw_json = serde_json::to_string(&feedback).map_err(|e| e.to_string())?;
  let created_at = feedback["createdAt"].as_str().unwrap_or("");
  
  conn.execute(
    "INSERT OR REPLACE INTO writing_feedbacks (attempt_id, task_number, raw_json, created_at) VALUES (?1, ?2, ?3, COALESCE(NULLIF(?4, ''), datetime('now')))",
    params![attempt_id, task_number, raw_json, created_at]
  ).map_err(|e| e.to_string())?;
  
  Ok(())
}

#[tauri::command]
fn get_writing_feedback(state: State<DbState>, attempt_id: String, task_number: i64) -> Result<Option<serde_json::Value>, String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let mut stmt = conn.prepare("SELECT raw_json FROM writing_feedbacks WHERE attempt_id = ?1 AND task_number = ?2 LIMIT 1").map_err(|e| e.to_string())?;
  let mut rows = stmt.query(params![attempt_id, task_number]).map_err(|e| e.to_string())?;
  
  if let Some(row) = rows.next().map_err(|e| e.to_string())? {
    let raw_json: String = row.get(0).map_err(|e| e.to_string())?;
    let feedback_val: serde_json::Value = serde_json::from_str(&raw_json).map_err(|e| e.to_string())?;
    Ok(Some(feedback_val))
  } else {
    Ok(None)
  }
}

#[tauri::command]
fn save_learner_profile(state: State<DbState>, profile: serde_json::Value) -> Result<(), String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let user_id = profile["userId"].as_str().ok_or("userId is missing")?;
  let target_band = profile["targetBand"].as_f64().ok_or("targetBand is missing")?;
  let exam_date = profile["examDate"].as_str().unwrap_or("");
  let weak_skills_json = serde_json::to_string(&profile["weakSkills"]).unwrap_or_else(|_| "[]".to_string());
  let created_at = profile["createdAt"].as_str().unwrap_or("");
  let updated_at = profile["updatedAt"].as_str().unwrap_or("");

  conn.execute(
    "INSERT OR REPLACE INTO learner_profiles (user_id, target_band, exam_date, weak_skills_json, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
    params![user_id, target_band, exam_date, weak_skills_json, created_at, updated_at]
  ).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
fn get_learner_profile(state: State<DbState>, user_id: String) -> Result<Option<serde_json::Value>, String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let mut stmt = conn.prepare("SELECT * FROM learner_profiles WHERE user_id = ?1 LIMIT 1").map_err(|e| e.to_string())?;
  let mut rows = stmt.query(params![user_id]).map_err(|e| e.to_string())?;

  if let Some(row) = rows.next().map_err(|e| e.to_string())? {
    let mut map = Map::new();
    map.insert("userId".to_string(), Value::String(row.get::<_, String>(0).map_err(|e| e.to_string())?));
    let target_band_f64 = row.get::<_, f64>(1).map_err(|e| e.to_string())?;
    let target_band_num = serde_json::Number::from_f64(target_band_f64)
      .ok_or_else(|| "Failed to convert targetBand float to JSON number".to_string())?;
    map.insert("targetBand".to_string(), Value::Number(target_band_num));
    map.insert("examDate".to_string(), Value::String(row.get::<_, String>(2).map_err(|e| e.to_string())?));
    
    let weak_skills_str: String = row.get(3).map_err(|e| e.to_string())?;
    let weak_skills: Value = serde_json::from_str(&weak_skills_str).unwrap_or(Value::Array(vec![]));
    map.insert("weakSkills".to_string(), weak_skills);
    
    map.insert("createdAt".to_string(), Value::String(row.get::<_, String>(4).map_err(|e| e.to_string())?));
    map.insert("updatedAt".to_string(), Value::String(row.get::<_, String>(5).map_err(|e| e.to_string())?));

    Ok(Some(Value::Object(map)))
  } else {
    Ok(None)
  }
}

#[tauri::command]
fn add_error_entry(state: State<DbState>, entry: serde_json::Value) -> Result<(), String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let id = entry["id"].as_str().ok_or("id is missing")?;
  let user_id = entry["userId"].as_str().ok_or("userId is missing")?;
  let attempt_id = entry["attemptId"].as_str().ok_or("attemptId is missing")?;
  let question_id = entry["questionId"].as_str().ok_or("questionId is missing")?;
  let question_type = entry["questionType"].as_str().ok_or("questionType is missing")?;
  let user_answer = entry["userAnswer"].as_str().unwrap_or("");
  let correct_answer = entry["correctAnswer"].as_str().ok_or("correctAnswer is missing")?;
  let explanation = entry["explanation"].as_str().unwrap_or("");
  let interval_days = entry["intervalDays"].as_i64().unwrap_or(1);
  let ease_factor = entry["easeFactor"].as_f64().unwrap_or(2.5);
  let repetitions = entry["repetitions"].as_i64().unwrap_or(0);
  let next_review_at = entry["nextReviewAt"].as_str().unwrap_or("");
  let created_at = entry["createdAt"].as_str().unwrap_or("");

  conn.execute(
    "INSERT OR REPLACE INTO error_notebook (
      id, user_id, attempt_id, question_id, question_type, 
      user_answer, correct_answer, explanation, interval_days, ease_factor, 
      repetitions, next_review_at, created_at
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
    params![
      id, user_id, attempt_id, question_id, question_type,
      user_answer, correct_answer, explanation, interval_days, ease_factor,
      repetitions, next_review_at, created_at
    ]
  ).map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
fn list_error_entries(state: State<DbState>, user_id: String) -> Result<Vec<serde_json::Value>, String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let mut stmt = conn.prepare("SELECT * FROM error_notebook WHERE user_id = ?1").map_err(|e| e.to_string())?;
  
  let col_count = stmt.column_count();
  let mut col_names = Vec::new();
  for i in 0..col_count {
    col_names.push(stmt.column_name(i).map_err(|e| e.to_string())?.to_string());
  }

  let mut rows = stmt.query(params![user_id]).map_err(|e| e.to_string())?;
  let mut results = Vec::new();

  while let Some(row) = rows.next().map_err(|e| e.to_string())? {
    let mut map = Map::new();
    for (i, name) in col_names.iter().enumerate() {
      let js_name = match name.as_str() {
        "user_id" => "userId",
        "attempt_id" => "attemptId",
        "question_id" => "questionId",
        "question_type" => "questionType",
        "user_answer" => "userAnswer",
        "correct_answer" => "correctAnswer",
        "interval_days" => "intervalDays",
        "ease_factor" => "easeFactor",
        "next_review_at" => "nextReviewAt",
        "created_at" => "createdAt",
        _ => name.as_str()
      };

      let value = match row.get_ref(i).map_err(|e| e.to_string())? {
        rusqlite::types::ValueRef::Null => Value::Null,
        rusqlite::types::ValueRef::Integer(n) => Value::Number(n.into()),
        rusqlite::types::ValueRef::Real(r) => {
          if let Some(num) = serde_json::Number::from_f64(r) {
            Value::Number(num)
          } else {
            Value::Null
          }
        },
        rusqlite::types::ValueRef::Text(t) => Value::String(String::from_utf8_lossy(t).into_owned()),
        rusqlite::types::ValueRef::Blob(_) => Value::Null,
      };
      map.insert(js_name.to_string(), value);
    }
    results.push(Value::Object(map));
  }

  Ok(results)
}

#[tauri::command]
fn update_error_entry_srs(state: State<DbState>, id: String, grade: i64) -> Result<(), String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  
  let mut stmt = conn.prepare("SELECT repetitions, interval_days, ease_factor FROM error_notebook WHERE id = ?1 LIMIT 1").map_err(|e| e.to_string())?;
  let mut rows = stmt.query(params![id]).map_err(|e| e.to_string())?;
  
  if let Some(row) = rows.next().map_err(|e| e.to_string())? {
    let mut repetitions: i64 = row.get(0).map_err(|e| e.to_string())?;
    let mut interval_days: i64 = row.get(1).map_err(|e| e.to_string())?;
    let mut ease_factor: f64 = row.get(2).map_err(|e| e.to_string())?;
    
    if grade >= 3 {
      if repetitions == 0 {
        interval_days = 1;
      } else if repetitions == 1 {
        interval_days = 6;
      } else {
        interval_days = ((interval_days as f64) * ease_factor).round() as i64;
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval_days = 1;
    }
    
    let q = grade as f64;
    ease_factor += 0.1 - (5.0 - q) * (0.08 + (5.0 - q) * 0.02);
    ease_factor = ease_factor.clamp(1.3, 2.5);
    
    conn.execute(
      "UPDATE error_notebook SET 
        repetitions = ?2, 
        interval_days = ?3, 
        ease_factor = ?4, 
        next_review_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '+' || ?3 || ' days') 
      WHERE id = ?1",
      params![id, repetitions, interval_days, ease_factor]
    ).map_err(|e| e.to_string())?;
  }
  
  Ok(())
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct RegisterUserArgs {
  id: String,
  username: String,
  password_hash: String,
  target_band: f64,
  exam_date: String,
  role: String,
  created_at: String,
}

#[tauri::command]
fn register_local_user(
  state: State<DbState>,
  user: RegisterUserArgs
) -> Result<(), String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  conn.execute(
    "INSERT OR REPLACE INTO local_users (id, username, password_hash, target_band, exam_date, role, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
    params![user.id, user.username, user.password_hash, user.target_band, user.exam_date, user.role, user.created_at]
  ).map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
fn get_local_user(state: State<DbState>, username: String) -> Result<Option<serde_json::Value>, String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let mut stmt = conn.prepare("SELECT id, username, password_hash, target_band, exam_date, role, created_at FROM local_users WHERE username = ?1 LIMIT 1").map_err(|e| e.to_string())?;
  let mut rows = stmt.query(params![username]).map_err(|e| e.to_string())?;
  
  if let Some(row) = rows.next().map_err(|e| e.to_string())? {
    let mut map = Map::new();
    map.insert("id".to_string(), Value::String(row.get::<_, String>(0).map_err(|e| e.to_string())?));
    map.insert("username".to_string(), Value::String(row.get::<_, String>(1).map_err(|e| e.to_string())?));
    map.insert("password_hash".to_string(), Value::String(row.get::<_, String>(2).map_err(|e| e.to_string())?));
    
    let target_band_f64 = row.get::<_, f64>(3).map_err(|e| e.to_string())?;
    let target_band_num = serde_json::Number::from_f64(target_band_f64)
      .ok_or_else(|| "Failed to convert target_band float to JSON number".to_string())?;
    map.insert("targetBand".to_string(), Value::Number(target_band_num));
    
    map.insert("examDate".to_string(), Value::String(row.get::<_, String>(4).map_err(|e| e.to_string())?));
    map.insert("role".to_string(), Value::String(row.get::<_, String>(5).map_err(|e| e.to_string())?));
    map.insert("createdAt".to_string(), Value::String(row.get::<_, String>(6).map_err(|e| e.to_string())?));
    
    Ok(Some(Value::Object(map)))
  } else {
    Ok(None)
  }
}

#[tauri::command]
fn list_local_users(state: State<DbState>) -> Result<Vec<serde_json::Value>, String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let mut stmt = conn.prepare("SELECT id, username, target_band, exam_date, role, created_at FROM local_users").map_err(|e| e.to_string())?;
  let mut rows = stmt.query(params![]).map_err(|e| e.to_string())?;
  let mut results = Vec::new();
  
  while let Some(row) = rows.next().map_err(|e| e.to_string())? {
    let mut map = Map::new();
    map.insert("id".to_string(), Value::String(row.get::<_, String>(0).map_err(|e| e.to_string())?));
    map.insert("username".to_string(), Value::String(row.get::<_, String>(1).map_err(|e| e.to_string())?));
    
    let target_band_f64 = row.get::<_, f64>(2).map_err(|e| e.to_string())?;
    let target_band_num = serde_json::Number::from_f64(target_band_f64)
      .ok_or_else(|| "Failed to convert target_band float to JSON number".to_string())?;
    map.insert("targetBand".to_string(), Value::Number(target_band_num));
    
    map.insert("examDate".to_string(), Value::String(row.get::<_, String>(3).map_err(|e| e.to_string())?));
    map.insert("role".to_string(), Value::String(row.get::<_, String>(4).map_err(|e| e.to_string())?));
    map.insert("createdAt".to_string(), Value::String(row.get::<_, String>(5).map_err(|e| e.to_string())?));
    
    results.push(Value::Object(map));
  }
  Ok(results)
}

#[tauri::command]
fn log_system_event(
  state: State<DbState>,
  id: String,
  level: String,
  module: String,
  message: String,
  payload: Option<String>
) -> Result<(), String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  conn.execute(
    "INSERT OR REPLACE INTO system_logs (id, level, module, message, payload, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'))",
    params![id, level, module, message, payload],
  ).map_err(|e| format!("Failed to save system log: {}", e))?;
  Ok(())
}

#[tauri::command]
fn list_system_logs(
  state: State<DbState>,
  limit: Option<usize>
) -> Result<Vec<serde_json::Value>, String> {
  let conn = state.conn.lock().map_err(|e| format!("Database lock poisoned: {}", e))?;
  let limit_val = limit.unwrap_or(100);
  let mut stmt = conn.prepare(
    "SELECT id, level, module, message, payload, created_at
     FROM system_logs
     ORDER BY created_at DESC
     LIMIT ?1"
  ).map_err(|e| e.to_string())?;
  
  let mut rows = stmt.query(params![limit_val]).map_err(|e| e.to_string())?;
  let mut results = Vec::new();
  
  while let Some(row) = rows.next().map_err(|e| e.to_string())? {
    let mut map = Map::new();
    map.insert("id".to_string(), Value::String(row.get::<_, String>(0).map_err(|e| e.to_string())?));
    map.insert("level".to_string(), Value::String(row.get::<_, String>(1).map_err(|e| e.to_string())?));
    map.insert("module".to_string(), Value::String(row.get::<_, String>(2).map_err(|e| e.to_string())?));
    map.insert("message".to_string(), Value::String(row.get::<_, String>(3).map_err(|e| e.to_string())?));
    
    let payload_val: Option<String> = row.get(4).map_err(|e| e.to_string())?;
    map.insert("payload".to_string(), match payload_val {
      Some(p) => Value::String(p),
      None => Value::Null
    });
    
    map.insert("createdAt".to_string(), Value::String(row.get::<_, String>(5).map_err(|e| e.to_string())?));
    results.push(Value::Object(map));
  }
  
  Ok(results)
}


// ==========================================
// 3. Database Initializer & Schema Migrator
// ==========================================

fn init_db(app_handle: &tauri::AppHandle) -> Result<Connection, String> {
  let mut path = app_handle.path_resolver().app_data_dir()
    .ok_or_else(|| "Failed to resolve app data directory path.".to_string())?;
  
  // Create AppData directory if missing
  fs::create_dir_all(&path).map_err(|e| format!("Failed to create AppData directory: {}", e))?;
  path.push("ielts_prep.db");
  
  let conn = Connection::open(path).map_err(|e| e.to_string())?;
  
  // Dynamic SQLite migrations block
  conn.execute(
    "CREATE TABLE IF NOT EXISTS attempts (
      local_id TEXT PRIMARY KEY,
      remote_id TEXT,
      test_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      last_saved_at TEXT NOT NULL,
      submitted_at TEXT,
      duration_seconds INTEGER NOT NULL,
      remaining_seconds INTEGER NOT NULL,
      answers_json TEXT NOT NULL,
      pause_ranges_json TEXT NOT NULL DEFAULT '[]',
      raw_score INTEGER,
      band_score REAL,
      total_questions INTEGER,
      is_mock_scoring INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT NOT NULL,
      version INTEGER NOT NULL
    )",
    params![],
  ).map_err(|e| format!("Failed to migrate attempts schema: {}", e))?;

  // Database migration for existing users: check if pause_ranges_json column is missing
  let mut column_exists = false;
  if let Ok(mut stmt) = conn.prepare("PRAGMA table_info(attempts)") {
    if let Ok(mut rows) = stmt.query([]) {
      while let Ok(Some(row)) = rows.next() {
        if let Ok(name) = row.get::<_, String>(1) {
          if name == "pause_ranges_json" {
            column_exists = true;
            break;
          }
        }
      }
    }
  }

  if !column_exists {
    let _ = conn.execute("ALTER TABLE attempts ADD COLUMN pause_ranges_json TEXT NOT NULL DEFAULT '[]'", params![]);
    println!("[SQLite Migration] Successfully migrated attempts schema: added missing pause_ranges_json column.");
  }

  conn.execute(
    "CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      skill TEXT NOT NULL,
      type TEXT NOT NULL,
      raw_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    )",
    params![],
  ).map_err(|e| format!("Failed to migrate tests schema: {}", e))?;

  conn.execute(
    "CREATE TABLE IF NOT EXISTS writing_feedbacks (
      attempt_id TEXT,
      task_number INTEGER,
      raw_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (attempt_id, task_number)
    )",
    params![],
  ).map_err(|e| format!("Failed to migrate writing_feedbacks schema: {}", e))?;

  conn.execute(
    "CREATE TABLE IF NOT EXISTS learner_profiles (
      user_id TEXT PRIMARY KEY,
      target_band REAL NOT NULL,
      exam_date TEXT,
      weak_skills_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )",
    params![],
  ).map_err(|e| format!("Failed to migrate learner_profiles schema: {}", e))?;

  conn.execute(
    "CREATE TABLE IF NOT EXISTS error_notebook (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      attempt_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      question_type TEXT NOT NULL,
      user_answer TEXT,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      interval_days INTEGER NOT NULL DEFAULT 1,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      repetitions INTEGER NOT NULL DEFAULT 0,
      next_review_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )",
    params![],
  ).map_err(|e| format!("Failed to migrate error_notebook schema: {}", e))?;

  conn.execute(
    "CREATE TABLE IF NOT EXISTS learning_events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      learner_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      source TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      raw_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    )",
    params![],
  ).map_err(|e| format!("Failed to migrate learning_events schema: {}", e))?;

  conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_learning_events_learner_occurred
      ON learning_events (learner_id, occurred_at)",
    params![],
  ).map_err(|e| format!("Failed to migrate learning_events learner index: {}", e))?;

  conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_learning_events_type_occurred
      ON learning_events (type, occurred_at)",
    params![],
  ).map_err(|e| format!("Failed to migrate learning_events type index: {}", e))?;
  
  conn.execute(
    "CREATE TABLE IF NOT EXISTS local_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      target_band REAL NOT NULL,
      exam_date TEXT,
      created_at TEXT NOT NULL
    )",
    params![],
  ).map_err(|e| format!("Failed to migrate local_users schema: {}", e))?;

  // Database migration for local_users: check if role column is missing
  let mut user_role_exists = false;
  if let Ok(mut stmt) = conn.prepare("PRAGMA table_info(local_users)") {
    if let Ok(mut rows) = stmt.query([]) {
      while let Ok(Some(row)) = rows.next() {
        if let Ok(name) = row.get::<_, String>(1) {
          if name == "role" {
            user_role_exists = true;
            break;
          }
        }
      }
    }
  }

  if !user_role_exists {
    let _ = conn.execute("ALTER TABLE local_users ADD COLUMN role TEXT NOT NULL DEFAULT 'student'", params![]);
    println!("[SQLite Migration] Successfully migrated local_users schema: added missing role column.");
  }
  
  conn.execute(
    "CREATE TABLE IF NOT EXISTS system_logs (
      id TEXT PRIMARY KEY,
      level TEXT NOT NULL,
      module TEXT NOT NULL,
      message TEXT NOT NULL,
      payload TEXT,
      created_at TEXT NOT NULL
    )",
    params![],
  ).map_err(|e| format!("Failed to migrate system_logs schema: {}", e))?;
  
  Ok(conn)
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let conn = init_db(&app.handle())?;
      app.manage(DbState {
        conn: Mutex::new(conn),
      });
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      keychain_get,
      keychain_set,
      keychain_delete,
      save_attempt,
      get_attempt,
      list_attempts,
      save_learning_event,
      list_learning_events,
      get_test,
      save_test,
      list_tests,
      save_writing_feedback,
      get_writing_feedback,
      save_learner_profile,
      get_learner_profile,
      add_error_entry,
      list_error_entries,
      update_error_entry_srs,
      register_local_user,
      get_local_user,
      list_local_users,
      log_system_event,
      list_system_logs
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
