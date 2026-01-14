<?php
/**
 * Plugin Name: Naivik PM Core
 * Description: Logic Controller with CORS support for React.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// 1. FIX CORS: Allow your React Dev Server (localhost:5173) to talk to WP
add_action( 'rest_api_init', function() {
    remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
    add_filter( 'rest_pre_serve_request', function( $value ) {
        header( 'Access-Control-Allow-Origin: http://localhost:5173' ); // Match your Vite port
        header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
        header( 'Access-Control-Allow-Credentials: true' );
        header( 'Access-Control-Allow-Headers: Authorization, Content-Type' );
        return $value;
    });
}, 15 );

// 2. REGISTER THE ENDPOINTS
add_action( 'rest_api_init', function () {
    register_rest_route( 'naivik/v1', '/chat', array(
        'methods'  => 'POST',
        'callback' => 'naivik_handle_chat',
        'permission_callback' => '__return_true', 
    ));
});

// Inside naivik-core.php

// ROUTE 1: User initiated chat (Conversational)
function naivik_handle_chat( $request ) {
    $openai = new Naivik_OpenAI();
    $reply = $openai->get_chat_response($request['message']);
    
    return rest_ensure_response(['message' => $reply]);
}

// ROUTE 2: Background Proactive Check (Data Heavy)
add_action('naivik_daily_proactive_check', function() {
    $gcp = new Naivik_GCP();
    $sheets = new Naivik_Sheets_Sync();
    
    $project_data = $sheets->get_all_rows(); // Fetch from External Ecosystem
    $nudges = $gcp->scan_data_for_nudges($project_data); // Analyze with Gemini Flash
    
    if ($nudges) {
        // Trigger "Initiates Nudge" logic from your diagram
        naivik_route_nudge_to_user($nudges);
    }
});

// 1. Schedule the event if it doesn't already exist
if ( ! wp_next_scheduled( 'naivik_daily_proactive_check' ) ) {
    wp_schedule_event( time(), 'daily', 'naivik_daily_proactive_check' );
}

// 2. Link the hook to your GCP logic function
add_action( 'naivik_daily_proactive_check', 'naivik_run_gcp_scan' );

function naivik_run_gcp_scan() {
    // This is where your GCP Vertex AI scanning logic lives
    error_log( 'Naivik Proactive Scan: GCP Vertex AI is now scanning Google Sheets...' );
}
