use actix_cors::Cors;
use actix_web::{post, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use aes::Aes128;
use block_modes::{BlockMode, Cbc};
use block_modes::block_padding::Pkcs7;
use hex_literal::hex;
use base64::{encode};
use dotenv::dotenv;
use std::env;

#[derive(Deserialize)]
struct EncryptRequest {
    password: String,
}

#[derive(Serialize)]
struct EncryptResponse {
    encrypted_password: String,
}

#[post("/encrypt")]
async fn encrypt(data: web::Json<EncryptRequest>) -> impl Responder {
    let key = env::var("ENCRYPTION_KEY").unwrap_or_else(|_| "defaultkey12345".to_string());
    let iv = env::var("ENCRYPTION_IV").unwrap_or_else(|_| "defaultiv1234567".to_string());

    let key_bytes = key.as_bytes();
    let iv_bytes = iv.as_bytes();

    let cipher = Cbc::<Aes128, Pkcs7>::new_from_slices(key_bytes, iv_bytes).unwrap();
    let encrypted_data = cipher.encrypt_vec(data.password.as_bytes());
    
    let encrypted_base64 = encode(&encrypted_data);

    HttpResponse::Ok().json(EncryptResponse { encrypted_password: encrypted_base64 })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    HttpServer::new(|| {
        App::new()
            .wrap(Cors::permissive())  
            .service(encrypt)
    })
    .bind(("0.0.0.0", 8000))?
    .run()
    .await
}
