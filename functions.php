add_action('rest_api_init', function () {
    register_rest_route('naivik/v1', '/chat', array(
        'methods' => 'POST',
        'callback' => 'handle_naivik_chat',
        'permission_callback' => '__return_true',
    ));
});

function handle_naivik_chat($data) {
    $user_input = $data['message'];
    
    // 1. Send to AI Intelligence Layer (e.g., GCP Vertex)
    // 2. AI returns JSON structure
    // 3. Update Google Sheets/Database if intent is 'update'
    
    return array(
        'message' => "I've processed your request and updated the Sheet.",
        'status' => 'success'
    );
}